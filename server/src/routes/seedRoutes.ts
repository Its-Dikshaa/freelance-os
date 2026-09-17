import { Router, Request, Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';
import Client from '../models/Client';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';

const router = Router();

const defaultProjects = [
  { id: "p1", name: "FreightAxis CRM", client: "LogiTech Ltd", clientEmail: "contact@logitech.io", budget: 85000, spent: 42000, status: "Active", deadline: "2026-04-15", color: "#3d5a4c", description: "Logistics dashboard & dispatch UI" },
  { id: "p2", name: "BrokerPad Redesign", client: "BrokerPad Inc", clientEmail: "hello@brokerpad.com", budget: 55000, spent: 48000, status: "In Review", deadline: "2026-03-30", color: "#c4623a", description: "Real estate broker platform overhaul" },
  { id: "p3", name: "PawPulse App", client: "PetWorld Pvt", clientEmail: "info@petworld.co", budget: 40000, spent: 18000, status: "Active", deadline: "2026-05-10", color: "#4a7fa5", description: "Pet care & vet appointment mobile app" },
  { id: "p4", name: "LuxPay Dashboard", client: "LuxFinance", clientEmail: "support@luxpay.io", budget: 70000, spent: 30000, status: "Active", deadline: "2026-04-01", color: "#c9963e", description: "Fintech analytics & payout suite" },
  { id: "p5", name: "AgriRent Platform", client: "AgriTech Co", clientEmail: "sales@agrirent.org", budget: 95000, spent: 95000, status: "Done", deadline: "2026-02-28", color: "#4e7360", description: "Tractor & farm tool rental marketplace" },
  { id: "p6", name: "Ease Well Portal", client: "EaseWell Health", clientEmail: "care@easewell.in", budget: 35000, spent: 5000, status: "Pending", deadline: "2026-06-01", color: "#7aaec8", description: "Wellness clinic patient dashboard" }
];

const defaultTasks = [
  { id: "t1", title: "Wireframes for CRM Leads", project: "FreightAxis CRM", status: "todo", dueDate: "Mar 25", priority: "High" },
  { id: "t2", title: "Prototype interactions", project: "BrokerPad Redesign", status: "in-progress", dueDate: "Mar 24", priority: "High" },
  { id: "t3", title: "Client feedback review", project: "FreightAxis CRM", status: "in-review", dueDate: "Mar 22", priority: "Medium" },
  { id: "t4", title: "Final handoff docs", project: "AgriRent Platform", status: "done", dueDate: "Mar 20", priority: "Low" },
  { id: "t5", title: "User flow diagram", project: "PawPulse App", status: "in-progress", dueDate: "Mar 30", priority: "Medium" },
  { id: "t6", title: "Color system finalization", project: "LuxPay Dashboard", status: "todo", dueDate: "Mar 28", priority: "Low" },
  { id: "t7", title: "Competitive analysis", project: "Ease Well Portal", status: "todo", dueDate: "Apr 2", priority: "Low" },
  { id: "t8", title: "Component library", project: "BrokerPad Redesign", status: "in-progress", dueDate: "Mar 26", priority: "High" }
];

const defaultClients = [
  { id: "c1", name: "Rohan Sharma", company: "LogiTech Ltd", email: "rohan@logitech.io", phone: "+91 98765 43210", totalBilled: 125000, status: "Active", projectsCount: 2, avatar: "RS" },
  { id: "c2", name: "Sarah Jenkins", company: "BrokerPad Inc", email: "sarah@brokerpad.com", phone: "+1 415 555 0192", totalBilled: 55000, status: "Active", projectsCount: 1, avatar: "SJ" },
  { id: "c3", name: "Ananya Roy", company: "PetWorld Pvt", email: "ananya@petworld.co", phone: "+91 91234 56789", totalBilled: 40000, status: "Active", projectsCount: 1, avatar: "AR" },
  { id: "c4", name: "Vikram Malhotra", company: "LuxFinance", email: "vikram@luxpay.io", phone: "+91 99887 76655", totalBilled: 70000, status: "Active", projectsCount: 1, avatar: "VM" },
  { id: "c5", name: "David Miller", company: "AgriTech Co", email: "david@agrirent.org", phone: "+1 212 555 0143", totalBilled: 95000, status: "Active", projectsCount: 1, avatar: "DM" },
  { id: "c6", name: "Pooja Verma", company: "EaseWell Health", email: "pooja@easewell.in", phone: "+91 98111 22334", totalBilled: 35000, status: "Lead", projectsCount: 1, avatar: "PV" }
];

const defaultInvoices = [
  { id: "i1", num: "INV-2026-001", client: "LogiTech Ltd", clientEmail: "rohan@logitech.io", amount: 45000, status: "Paid", issueDate: "2026-02-01", dueDate: "2026-02-15", items: [{ desc: "UI/UX Design Milestone 1", qty: 1, rate: 45000 }] },
  { id: "i2", num: "INV-2026-002", client: "BrokerPad Inc", clientEmail: "sarah@brokerpad.com", amount: 30000, status: "Paid", issueDate: "2026-02-10", dueDate: "2026-02-25", items: [{ desc: "Discovery & Wireframes", qty: 1, rate: 30000 }] },
  { id: "i3", num: "INV-2026-003", client: "LogiTech Ltd", clientEmail: "rohan@logitech.io", amount: 40000, status: "Pending", issueDate: "2026-03-01", dueDate: "2026-03-20", items: [{ desc: "Dashboard Design System", qty: 1, rate: 40000 }] },
  { id: "i4", num: "INV-2026-004", client: "LuxFinance", clientEmail: "vikram@luxpay.io", amount: 35000, status: "Pending", issueDate: "2026-03-05", dueDate: "2026-03-25", items: [{ desc: "Fintech Dashboard Phase 1", qty: 1, rate: 35000 }] },
  { id: "i5", num: "INV-2026-005", client: "PetWorld Pvt", clientEmail: "ananya@petworld.co", amount: 18000, status: "Overdue", issueDate: "2026-02-15", dueDate: "2026-03-01", items: [{ desc: "App Concept & Branding", qty: 1, rate: 18000 }] }
];

const defaultPayments = [
  { id: "pay1", txId: "TXN-882910", invoiceNum: "INV-2026-001", client: "LogiTech Ltd", amount: 45000, date: "2026-02-14", method: "Direct Transfer", status: "Completed" },
  { id: "pay2", txId: "TXN-773821", invoiceNum: "INV-2026-002", client: "BrokerPad Inc", amount: 30000, date: "2026-02-24", method: "UPI", status: "Completed" },
  { id: "pay3", txId: "TXN-661922", invoiceNum: "INV-2026-000", client: "AgriTech Co", amount: 35000, date: "2026-01-20", method: "Direct Transfer", status: "Completed" }
];

router.post('/', async (req: Request, res: Response) => {
  try {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Client.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});

    await User.create({
      name: 'Diksha Jangra',
      role: 'UI/UX Designer',
      email: 'diksha@design.io',
      studio: 'Studio Diksha',
      hourlyRate: 85,
      currency: '₹',
      gst: 'GSTIN07AAAAA0000A1Z5',
      paymentNotes: 'Bank Transfer / UPI accepted. Payment due within 15 days.',
      hasCompletedOnboarding: true
    });

    await Project.insertMany(defaultProjects);
    await Task.insertMany(defaultTasks);
    await Client.insertMany(defaultClients);
    await Invoice.insertMany(defaultInvoices);
    await Payment.insertMany(defaultPayments);

    res.json({ message: 'MongoDB Database seeded successfully with default sample data!' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
