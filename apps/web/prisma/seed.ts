import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Category mapping
const categorizeLine = (description: string): string => {
  const desc = description.toLowerCase();
  if (desc.includes('dienstleistung') || desc.includes('service')) return 'Services';
  if (desc.includes('produkt') || desc.includes('product')) return 'Products';
  if (desc.includes('software') || desc.includes('lizenz')) return 'Software';
  if (desc.includes('beratung') || desc.includes('consulting')) return 'Consulting';
  if (desc.includes('material')) return 'Materials';
  return 'General';
};

async function seedInvoices() {
  console.log('📄 Seeding invoices...');
  
  // Read JSON file
  const dataPath = path.join(__dirname, '../../../data/Analytics_Test_Data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ File not found: ${dataPath}`);
    console.error('Please place Analytics_Test_Data.json in the data/ folder');
    return;
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const documents = JSON.parse(rawData);
  
  console.log(`Found ${documents.length} documents to process`);
  
  let processed = 0;
  let errors = 0;
  
  for (const doc of documents) {
    try {
      // Create Document
      const document = await prisma.document.create({
        data: {
          id: doc._id,
          name: doc.name,
          filePath: doc.filePath,
          fileSize: BigInt(doc.fileSize.$numberLong || doc.fileSize),
          fileType: doc.fileType,
          status: doc.status,
          organizationId: doc.organizationId,
          departmentId: doc.departmentId,
          createdAt: new Date(doc.createdAt.$date || doc.createdAt),
          updatedAt: new Date(doc.updatedAt.$date || doc.updatedAt),
          processedAt: doc.processedAt ? new Date(doc.processedAt.$date || doc.processedAt) : null,
          analyticsId: doc.analyticsId || null,
          metadata: doc.metadata || {},
          validatedData: doc.validatedData || null,
        },
      });
      
      const llm = doc.extractedData?.llmData;
      if (!llm) continue;
      
      // Create or find Vendor
      const vendorData = llm.vendor?.value;
      let vendor;
      if (vendorData?.vendorName?.value) {
        vendor = await prisma.vendor.upsert({
          where: {
            name_taxId: {
              name: vendorData.vendorName.value,
              taxId: vendorData.vendorTaxId?.value || '',
            },
          },
          update: {},
          create: {
            name: vendorData.vendorName.value,
            partyNumber: vendorData.vendorPartyNumber?.value,
            address: vendorData.vendorAddress?.value,
            taxId: vendorData.vendorTaxId?.value,
          },
        });
      }
      
      /// Create or find Customer (no unique required)
      const customerData = llm.customer?.value;
      let customer = null;

      if (customerData?.customerName?.value) {
        // Try to find customer with same name
        customer = await prisma.customer.findFirst({
          where: {
            name: customerData.customerName.value,
          },
        });

        // If not found, create new one
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              name: customerData.customerName.value,
              address: customerData.customerAddress?.value,
            },
          });
        }
      }

      
      const invoiceData = llm.invoice?.value;
      if (!invoiceData || !vendor || !customer) continue;
      
      // Create Invoice
      const invoice = await prisma.invoice.create({
        data: {
          documentId: document.id,
          invoiceNumber: invoiceData.invoiceId?.value || `INV-${Date.now()}`,
          invoiceDate: new Date(invoiceData.invoiceDate?.value || doc.createdAt.$date || doc.createdAt),
          deliveryDate: invoiceData.deliveryDate?.value 
            ? new Date(invoiceData.deliveryDate.value) 
            : null,
          status: doc.status === 'processed' ? 'processed' : 'pending',
          vendorId: vendor.id,
          customerId: customer.id,
        },
      });
      
      // Create Line Items
      const lineItemsData = llm.lineItems?.value?.items?.value || [];
      for (const item of lineItemsData) {
        const category = categorizeLine(item.description?.value || '');
        
        await prisma.lineItem.create({
          data: {
            invoiceId: invoice.id,
            srNo: item.srNo?.value || 0,
            description: item.description?.value || '',
            quantity: item.quantity?.value || 0,
            unitPrice: item.unitPrice?.value || 0,
            totalPrice: item.totalPrice?.value || 0,
            sachkonto: item.Sachkonto?.value ? String(item.Sachkonto.value) : null,
            buSchluessel: item.BUSchluessel?.value ? String(item.BUSchluessel.value) : null,
            category,
          },
        });
      }
      
      // Create Payment
      const paymentData = llm.payment?.value;
      if (paymentData) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            dueDate: paymentData.dueDate?.value 
              ? new Date(paymentData.dueDate.value) 
              : null,
            paymentTerms: paymentData.paymentTerms?.value,
            bankAccountNumber: paymentData.bankAccountNumber?.value,
            bic: paymentData.BIC?.value,
            accountName: paymentData.accountName?.value,
            netDays: paymentData.netDays?.value || 0,
            discountPercentage: paymentData.discountPercentage?.value 
              ? parseFloat(paymentData.discountPercentage.value) 
              : null,
            discountDays: paymentData.discountDays?.value,
            discountDueDate: paymentData.discountDueDate?.value 
              ? new Date(paymentData.discountDueDate.value) 
              : null,
            discountedTotal: paymentData.discountedTotal?.value 
              ? parseFloat(paymentData.discountedTotal.value) 
              : null,
          },
        });
      }
      
      // Create Summary
      const summaryData = llm.summary?.value;
      if (summaryData) {
        await prisma.summary.create({
          data: {
            invoiceId: invoice.id,
            documentType: summaryData.documentType?.value,
            subTotal: summaryData.subTotal?.value || 0,
            totalTax: summaryData.totalTax?.value || 0,
            invoiceTotal: summaryData.invoiceTotal?.value || 0,
            currencySymbol: summaryData.currencySymbol?.value || 'EUR',
          },
        });
      }
      
      processed++;
      if (processed % 10 === 0) {
        console.log(`✓ Processed ${processed}/${documents.length} documents`);
      }
    } catch (error) {
      errors++;
      console.error(`✗ Error processing document ${doc.name}:`, error);
    }
  }
  
  console.log(`\n✅ Invoice seeding complete!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Errors: ${errors}`);
}

async function seedChatData() {
  console.log('\n💬 Seeding chat data...');
  
  try {
    // Create a demo chat session
    const session = await prisma.chatSession.create({
      data: {
        userId: 'default',
      },
    });
    
    // Create some example chat messages
    const exampleMessages = [
      {
        role: 'user',
        content: 'What is the total spend?',
        sql: null,
        results: null,
      },
      {
        role: 'assistant',
        content: 'The total spend is €12,679.25',
        sql: 'SELECT SUM(ABS("invoiceTotal")) as total_spend FROM "Summary";',
        results: [{ total_spend: 12679.25 }],
      },
      {
        role: 'user',
        content: 'Show me top 5 vendors',
        sql: null,
        results: null,
      },
      {
        role: 'assistant',
        content: 'Here are the top 5 vendors by spend',
        sql: 'SELECT v.name, SUM(ABS(s."invoiceTotal")) as total FROM "Vendor" v JOIN "Invoice" i ON v.id = i."vendorId" JOIN "Summary" s ON i.id = s."invoiceId" GROUP BY v.name ORDER BY total DESC LIMIT 5;',
        results: [
          { name: 'Musterfirma Müller', total: 8879.25 },
          { name: 'Global Supply', total: 3800.00 },
        ],
      },
    ];
    
    for (const msg of exampleMessages) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: msg.role,
          content: msg.content,
          sql: msg.sql,
          results: msg.results as any,
        },
      });
    }
    
    console.log('✅ Chat data seeding complete!');
    console.log(`   Created 1 session with ${exampleMessages.length} messages`);
  } catch (error) {
    console.error('✗ Error seeding chat data:', error);
  }
}

async function main() {
  console.log('🌱 Starting database seed...\n');
  
  try {
    // Seed invoices
    await seedInvoices();
    
    // Seed chat data
    await seedChatData();
    
    // Print statistics
    console.log('\n📊 Database Statistics:');
    const stats = await Promise.all([
      prisma.document.count(),
      prisma.invoice.count(),
      prisma.vendor.count(),
      prisma.customer.count(),
      prisma.lineItem.count(),
      prisma.payment.count(),
      prisma.summary.count(),
      prisma.chatSession.count(),
      prisma.chatMessage.count(),
    ]);
    
    console.log(`   Documents: ${stats[0]}`);
    console.log(`   Invoices: ${stats[1]}`);
    console.log(`   Vendors: ${stats[2]}`);
    console.log(`   Customers: ${stats[3]}`);
    console.log(`   Line Items: ${stats[4]}`);
    console.log(`   Payments: ${stats[5]}`);
    console.log(`   Summaries: ${stats[6]}`);
    console.log(`   Chat Sessions: ${stats[7]}`);
    console.log(`   Chat Messages: ${stats[8]}`);
    
    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });