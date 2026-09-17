import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import clientRoutes from './routes/clientRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import seedRoutes from './routes/seedRoutes';
import { runInitialMigration } from './config/initMigration';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/seed', seedRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FreelanceOS Express REST API is running' });
});

// Interactive Backend Admin Dashboard at http://localhost:5050/
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>FreelanceOS — Express & MongoDB Backend Admin Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet" />
        <style>
          :root {
            --bg: #1e1b18; --card: #2c2825; --card2: #38332f;
            --accent: #e8c07a; --forest: #4e7360; --sage: #8fac99;
            --text: #f7f4ef; --sub: #b5a898; --border: rgba(255,255,255,0.1);
          }
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Outfit', sans-serif; background:var(--bg); color:var(--text); min-height:100vh; padding:30px; }
          .header { display:flex; justify-content:space-between; align-items:center; border-b:1px solid var(--border); pb:20px; margin-bottom:25px; }
          .logo { font-family:'Playfair Display', serif; font-size:24px; color:var(--text); }
          .logo span { color:var(--accent); font-style:italic; }
          .status-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(78,115,96,0.2); border:1px solid var(--forest); color:var(--sage); padding:6px 14px; border-radius:20px; font-size:12px; font-weight:500; }
          .dot { width:8px; height:8px; border-radius:50%; background:var(--sage); animation:pulse 1.5s infinite; }
          @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
          
          .stats-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:25px; }
          .stat-card { background:var(--card); border:1px solid var(--border); padding:18px; border-radius:14px; }
          .stat-label { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:var(--sub); margin-bottom:6px; font-weight:600; }
          .stat-val { font-size:26px; font-weight:600; font-family:'Playfair Display', serif; color:var(--accent); }

          .controls { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
          .btn { background:var(--forest); color:#fff; border:none; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:500; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:0.2s; }
          .btn:hover { background:#3d5a4c; }
          .btn-outline { background:transparent; border:1px solid var(--border); color:var(--text); }
          .btn-outline:hover { background:var(--card2); }
          
          .tabs { display:flex; gap:8px; border-b:1px solid var(--border); margin-bottom:20px; }
          .tab { padding:10px 18px; background:transparent; border:none; color:var(--sub); font-size:13.5px; font-weight:500; cursor:pointer; border-bottom:2px solid transparent; }
          .tab.active { color:var(--accent); border-bottom-color:var(--accent); font-weight:600; }

          .panel { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px; overflow-x:auto; }
          table { width:100%; border-collapse:collapse; text-align:left; font-size:13px; }
          th { padding:12px; background:var(--card2); color:var(--sub); font-size:10.5px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--border); }
          td { padding:12px; border-bottom:1px solid var(--border); color:var(--text); }
          tr:hover { background:rgba(255,255,255,0.02); }
          .badge { padding:3px 8px; border-radius:12px; font-size:10px; font-weight:600; background:rgba(255,255,255,0.1); }
          pre { background:#151311; padding:15px; border-radius:10px; font-size:12px; color:#e8c07a; overflow-x:auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Freelance<span>OS</span> API Dashboard</div>
            <div style="font-size:12px; color:var(--sub); margin-top:4px;">Express REST API Server · Port 5050 · MongoDB Connected</div>
          </div>
          <div class="status-badge">
            <span class="dot"></span>
            <span>REST API & MongoDB Live</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Projects</div>
            <div class="stat-val" id="stat-projects">-</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Tasks</div>
            <div class="stat-val" id="stat-tasks">-</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Clients</div>
            <div class="stat-val" id="stat-clients">-</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Invoices</div>
            <div class="stat-val" id="stat-invoices">-</div>
          </div>
        </div>

        <div class="controls">
          <a class="btn" href="http://localhost:3000" target="_blank">🚀 Open Next.js App (localhost:3000)</a>
          <button class="btn btn-outline" onclick="seedDatabase()">🌱 Seed Sample Data</button>
          <button class="btn btn-outline" onclick="loadAllData()">🔄 Refresh Data</button>
        </div>

        <div class="tabs">
          <button class="tab active" onclick="switchTab('projects')">📁 Projects DB</button>
          <button class="tab" onclick="switchTab('tasks')">📋 Tasks DB</button>
          <button class="tab" onclick="switchTab('clients')">👥 Clients DB</button>
          <button class="tab" onclick="switchTab('invoices')">🧾 Invoices DB</button>
          <button class="tab" onclick="switchTab('payments')">💳 Payments DB</button>
          <button class="tab" onclick="switchTab('raw')">🔍 Raw JSON Explorer</button>
        </div>

        <div class="panel" id="content-panel">
          <div style="text-align:center; padding:30px; color:var(--sub);">Loading Backend Database Records...</div>
        </div>

        <script>
          let currentTab = 'projects';
          let store = { projects:[], tasks:[], clients:[], invoices:[], payments:[] };

          async function loadAllData() {
            try {
              const [p, t, c, i, pay] = await Promise.all([
                fetch('/api/projects').then(r => r.json()),
                fetch('/api/tasks').then(r => r.json()),
                fetch('/api/clients').then(r => r.json()),
                fetch('/api/invoices').then(r => r.json()),
                fetch('/api/payments').then(r => r.json()),
              ]);
              store = { projects:p, tasks:t, clients:c, invoices:i, payments:pay };
              
              document.getElementById('stat-projects').innerText = p.length || 0;
              document.getElementById('stat-tasks').innerText = t.length || 0;
              document.getElementById('stat-clients').innerText = c.length || 0;
              document.getElementById('stat-invoices').innerText = i.length || 0;
              
              renderTab();
            } catch(e) {
              console.error(e);
            }
          }

          function switchTab(t) {
            currentTab = t;
            document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            renderTab();
          }

          function renderTab() {
            const panel = document.getElementById('content-panel');
            if (currentTab === 'projects') {
              let rows = store.projects.map(x => \`
                <tr>
                  <td><b>\${x.name}</b></td>
                  <td>\${x.client}</td>
                  <td><span class="badge">\${x.status}</span></td>
                  <td>₹\${(x.budget||0).toLocaleString('en-IN')}</td>
                  <td>\${x.deadline}</td>
                </tr>
              \`).join('');
              panel.innerHTML = \`
                <table>
                  <thead><tr><th>Project Name</th><th>Client</th><th>Status</th><th>Budget</th><th>Deadline</th></tr></thead>
                  <tbody>\${rows || '<tr><td colspan="5">No projects found</td></tr>'}</tbody>
                </table>
              \`;
            } else if (currentTab === 'tasks') {
              let rows = store.tasks.map(x => \`
                <tr>
                  <td><b>\${x.title}</b></td>
                  <td>\${x.project}</td>
                  <td><span class="badge">\${x.status}</span></td>
                  <td>\${x.dueDate || x.due}</td>
                </tr>
              \`).join('');
              panel.innerHTML = \`
                <table>
                  <thead><tr><th>Task Title</th><th>Project</th><th>Status Column</th><th>Due Date</th></tr></thead>
                  <tbody>\${rows || '<tr><td colspan="4">No tasks found</td></tr>'}</tbody>
                </table>
              \`;
            } else if (currentTab === 'clients') {
              let rows = store.clients.map(x => \`
                <tr>
                  <td><b>\${x.name}</b></td>
                  <td>\${x.company || x.industry || '-'}</td>
                  <td>\${x.email}</td>
                  <td>\${x.phone || '-'}</td>
                </tr>
              \`).join('');
              panel.innerHTML = \`
                <table>
                  <thead><tr><th>Client Name</th><th>Company / Industry</th><th>Email</th><th>Phone</th></tr></thead>
                  <tbody>\${rows || '<tr><td colspan="4">No clients found</td></tr>'}</tbody>
                </table>
              \`;
            } else if (currentTab === 'invoices') {
              let rows = store.invoices.map(x => \`
                <tr>
                  <td><b>\${x.num}</b></td>
                  <td>\${x.client}</td>
                  <td>₹\${(x.amount||0).toLocaleString('en-IN')}</td>
                  <td><span class="badge">\${x.status}</span></td>
                  <td>\${x.due}</td>
                </tr>
              \`).join('');
              panel.innerHTML = \`
                <table>
                  <thead><tr><th>Invoice #</th><th>Client</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead>
                  <tbody>\${rows || '<tr><td colspan="5">No invoices found</td></tr>'}</tbody>
                </table>
              \`;
            } else if (currentTab === 'payments') {
              let rows = store.payments.map(x => \`
                <tr>
                  <td><b>\${x.txId}</b></td>
                  <td>\${x.invoiceNum}</td>
                  <td>\${x.client}</td>
                  <td>₹\${(x.amount||0).toLocaleString('en-IN')}</td>
                  <td>\${x.method}</td>
                </tr>
              \`).join('');
              panel.innerHTML = \`
                <table>
                  <thead><tr><th>Tx ID</th><th>Invoice #</th><th>Client</th><th>Amount</th><th>Payment Method</th></tr></thead>
                  <tbody>\${rows || '<tr><td colspan="5">No payments found</td></tr>'}</tbody>
                </table>
              \`;
            } else if (currentTab === 'raw') {
              panel.innerHTML = \`<pre>\${JSON.stringify(store, null, 2)}</pre>\`;
            }
          }

          async function seedDatabase() {
            if (confirm('Reset and seed database with default sample records?')) {
              const res = await fetch('/api/seed', { method:'POST' });
              const d = await res.json();
              alert(d.message);
              loadAllData();
            }
          }

          loadAllData();
        </script>
      </body>
    </html>
  `);
});

// Boot Server & Database
const startServer = async () => {
  await connectDB();
  await runInitialMigration();
  app.listen(PORT, () => {
    console.log(`[Express] FreelanceOS backend server listening on http://localhost:${PORT}`);
  });
};

startServer();
