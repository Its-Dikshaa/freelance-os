import { Router, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import Client from '../models/Client';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

const defaultProjects = [
  { id: "p1", name: "FreightAxis CRM", client: "LogiTech Ltd", clientEmail: "contact@logitech.io", budget: 85000, spent: 42000, progress: 50, status: "Active", deadline: "2026-04-15", color: "#3d5a4c", desc: "Logistics dashboard & dispatch UI" },
  { id: "p2", name: "BrokerPad Redesign", client: "BrokerPad Inc", clientEmail: "hello@brokerpad.com", budget: 55000, spent: 48000, progress: 87, status: "Review", deadline: "2026-03-30", color: "#c4623a", desc: "Real estate broker platform overhaul" },
  { id: "p3", name: "PawPulse App", client: "PetWorld Pvt", clientEmail: "info@petworld.co", budget: 40000, spent: 18000, progress: 45, status: "Active", deadline: "2026-05-10", color: "#4a7fa5", desc: "Pet care & vet appointment mobile app" },
  { id: "p4", name: "LuxPay Dashboard", client: "LuxFinance", clientEmail: "support@luxpay.io", budget: 70000, spent: 30000, progress: 43, status: "Active", deadline: "2026-04-01", color: "#c9963e", desc: "Fintech analytics & payout suite" },
  { id: "p5", name: "AgriRent Platform", client: "AgriTech Co", clientEmail: "sales@agrirent.org", budget: 95000, spent: 95000, progress: 100, status: "Done", deadline: "2026-02-28", color: "#4e7360", desc: "Tractor & farm tool rental marketplace" },
  { id: "p6", name: "Ease Well Portal", client: "EaseWell Health", clientEmail: "care@easewell.in", budget: 35000, spent: 5000, progress: 14, status: "Pending", deadline: "2026-06-01", color: "#7aaec8", desc: "Wellness clinic patient dashboard" }
];

const relDate = (days: number): string => {
  const d = new Date(Date.now() + days * 86400000);
  return d.toISOString().slice(0, 10);
};

const defaultTasks = [
  { id: "t1", title: "Wireframes for CRM Leads", project: "FreightAxis CRM", status: "Todo", due: relDate(3), priority: "High" },
  { id: "t2", title: "Prototype interactions", project: "BrokerPad Redesign", status: "InProgress", due: relDate(5), priority: "High" },
  { id: "t3", title: "Client feedback review", project: "FreightAxis CRM", status: "Review", due: relDate(-2), priority: "Medium" },
  { id: "t4", title: "Final handoff docs", project: "AgriRent Platform", status: "Done", due: relDate(-7), priority: "Low" },
  { id: "t5", title: "User flow diagram", project: "PawPulse App", status: "InProgress", due: relDate(7), priority: "Medium" },
  { id: "t6", title: "Color system finalization", project: "LuxPay Dashboard", status: "Todo", due: relDate(10), priority: "Low" },
  { id: "t7", title: "Competitive analysis", project: "Ease Well Portal", status: "Todo", due: relDate(12), priority: "Low" },
  { id: "t8", title: "Component library", project: "BrokerPad Redesign", status: "InProgress", due: relDate(4), priority: "High" }
];

const defaultClients = [
  { id: "c1", name: "LogiTech Ltd", industry: "Logistics", email: "rohan@logitech.io", phone: "+91 98765 43210", value: 85000, status: "Active", projects: 1, color: "#3d5a4c", initials: "LT", notes: "Primary Contact: Rohan Sharma · Long-term retainer client" },
  { id: "c2", name: "BrokerPad Inc", industry: "Real Estate", email: "sarah@brokerpad.com", phone: "+1 415 555 0192", value: 30000, status: "Active", projects: 1, color: "#c4623a", initials: "BP", notes: "Primary Contact: Sarah Jenkins" },
  { id: "c3", name: "PetWorld Pvt", industry: "Pet Care", email: "ananya@petworld.co", phone: "+91 91234 56789", value: 0, status: "Active", projects: 1, color: "#4a7fa5", initials: "PW", notes: "Primary Contact: Ananya Roy" },
  { id: "c4", name: "LuxFinance", industry: "FinTech", email: "vikram@luxpay.io", phone: "+91 99887 76655", value: 0, status: "Active", projects: 1, color: "#c9963e", initials: "LF", notes: "Primary Contact: Vikram Malhotra" },
  { id: "c5", name: "AgriTech Co", industry: "Agriculture", email: "david@agrirent.org", phone: "+1 212 555 0143", value: 35000, status: "Active", projects: 1, color: "#4e7360", initials: "AT", notes: "Primary Contact: David Miller" },
  { id: "c6", name: "EaseWell Health", industry: "Healthcare", email: "pooja@easewell.in", phone: "+91 98111 22334", value: 0, status: "Lead", projects: 1, color: "#7a5c8a", initials: "EH", notes: "Primary Contact: Pooja Verma · Referred by ops team" }
];

const defaultInvoices = [
  { id: "i1", num: "INV-2026-001", client: "LogiTech Ltd", clientEmail: "rohan@logitech.io", amount: 45000, status: "Paid", date: "2026-02-01", due: "2026-02-15", desc: "UI/UX Design Milestone 1", items: [{ desc: "UI/UX Design Milestone 1", qty: 1, rate: 45000 }] },
  { id: "i2", num: "INV-2026-002", client: "BrokerPad Inc", clientEmail: "sarah@brokerpad.com", amount: 30000, status: "Paid", date: "2026-02-10", due: "2026-02-25", desc: "Discovery & Wireframes", items: [{ desc: "Discovery & Wireframes", qty: 1, rate: 30000 }] },
  { id: "i3", num: "INV-2026-003", client: "LogiTech Ltd", clientEmail: "rohan@logitech.io", amount: 40000, status: "Unpaid", date: "2026-03-01", due: "2026-03-20", desc: "Dashboard Design System", items: [{ desc: "Dashboard Design System", qty: 1, rate: 40000 }] },
  { id: "i4", num: "INV-2026-004", client: "LuxFinance", clientEmail: "vikram@luxpay.io", amount: 35000, status: "Unpaid", date: "2026-03-05", due: "2026-03-25", desc: "Fintech Dashboard Phase 1", items: [{ desc: "Fintech Dashboard Phase 1", qty: 1, rate: 35000 }] },
  { id: "i5", num: "INV-2026-005", client: "PetWorld Pvt", clientEmail: "ananya@petworld.co", amount: 18000, status: "Overdue", date: "2026-02-15", due: "2026-03-01", desc: "App Concept & Branding", items: [{ desc: "App Concept & Branding", qty: 1, rate: 18000 }] }
];

const defaultPayments = [
  { id: "pay1", txId: "TXN-882910", invoiceNum: "INV-2026-001", client: "LogiTech Ltd", amount: 45000, date: "2026-02-14", method: "Direct Transfer", status: "Completed" },
  { id: "pay2", txId: "TXN-773821", invoiceNum: "INV-2026-002", client: "BrokerPad Inc", amount: 30000, date: "2026-02-24", method: "UPI", status: "Completed" },
  { id: "pay3", txId: "TXN-661922", invoiceNum: "INV-2026-000", client: "AgriTech Co", amount: 35000, date: "2026-01-20", method: "Direct Transfer", status: "Completed" }
];

// POST /api/seed - Reset the CURRENT user's workspace to default sample data ONLY
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    await Project.deleteMany({ userId });
    await Task.deleteMany({ userId });
    await Client.deleteMany({ userId });
    await Invoice.deleteMany({ userId });
    await Payment.deleteMany({ userId });

    await Project.insertMany(defaultProjects.map(p => ({ ...p, userId })));
    await Task.insertMany(defaultTasks.map(t => ({ ...t, userId })));
    await Client.insertMany(defaultClients.map(c => ({ ...c, userId })));
    await Invoice.insertMany(defaultInvoices.map(i => ({ ...i, userId })));
    await Payment.insertMany(defaultPayments.map(p => ({ ...p, userId })));

    res.json({ message: 'Your workspace has been reset with default sample data!' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
