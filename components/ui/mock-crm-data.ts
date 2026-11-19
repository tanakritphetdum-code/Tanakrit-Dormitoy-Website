// components/ui/mock-crm-data.ts
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
}

export interface MetricChip {
  id: string;
  label: string;
  value: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  badge: string;
  amount: string;
  subtitle: string;
  approved: boolean;
}

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  company: string;
  status: 'Active' | 'Trial' | 'Lead' | 'Churned';
  owner: string;
  ltv: string;
  lastContact: string;
}

export interface DealCard {
  id: string;
  title: string;
  company: string;
  value: string;
  probability: string;
  ownerAvatar: string;
  tag: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  maxStock: number;
  active: boolean;
  gradient: string;
  iconName: string;
}

export const MOCK_CRM_DATA = {
  team: [
    { id: '1', name: 'Alex Morgan', role: 'Head of Sales', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', online: true },
    { id: '2', name: 'Sarah Chen', role: 'Account Exec', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', online: true },
    { id: '3', name: 'David Kim', role: 'Solutions Eng', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', online: true },
    { id: '4', name: 'Elena Rostova', role: 'Customer Success', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', online: true },
  ],
  onlineCount: 4,
  extraCount: 3,

  target: {
    initialPercent: 63,
    metricChips: [
      { id: 'revenue', label: 'Revenue', value: '$840k' },
      { id: 'deals', label: 'Deals', value: '42 closed' },
      { id: 'calls', label: 'Calls', value: '318 logged' },
      { id: 'meetings', label: 'Meetings', value: '94 held' },
    ]
  },

  revenue: {
    current: '$23.1k',
    target: '$27k',
    delta: '+12.4% vs yesterday',
    hourly: [
      { time: '09:00', val: '$1.8k' },
      { time: '11:00', val: '$4.2k' },
      { time: '13:00', val: '$8.6k' },
      { time: '15:00', val: '$14.1k' },
      { time: '17:00', val: '$19.3k' },
      { time: '19:00', val: '$23.1k' },
    ],
    chartPointsToday: [18, 25, 42, 60, 75, 88],
    chartPointsWeek: [32, 45, 58, 62, 79, 91, 95],
    chartPointsMonth: [20, 35, 45, 60, 70, 78, 85, 92, 98],
  },

  leads: {
    count: '1,186',
    delta: '+18.2%',
    miniBars: [24, 38, 45, 52, 68, 82, 94], // last one highlighted blue
  },

  approvals: [
    {
      id: 'app-1',
      title: 'Enterprise Annual Tier',
      badge: 'DISCOUNT',
      amount: '$4,800',
      subtitle: 'Northwind Co. · 20% requested by Alex',
      approved: false
    },
    {
      id: 'app-2',
      title: 'Extended SLA Add-on',
      badge: 'ADDON',
      amount: '$1,200',
      subtitle: 'Apex Global · 24/7 dedicated support',
      approved: false
    }
  ],

  kpiTiles: {
    customers: { count: '2,739', delta: '+8.4%', active: true },
    pipeline: {
      total: '$1.19M',
      active: true,
      funnel: [
        { stage: 'Lead', pct: 90, val: '$420k' },
        { stage: 'Qualified', pct: 68, val: '$380k' },
        { stage: 'Proposal', pct: 45, val: '$260k' },
        { stage: 'Won', pct: 25, val: '$130k' }
      ]
    },
    activeUsers: { count: '300', delta: '+24 now', active: true, sparkline: [12, 18, 14, 25, 22, 35, 30, 42, 48] },
    openTickets: { count: '17', delta: '-3 today', isNegative: true, active: false }
  },

  weeklySales: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [14.2, 18.5, 24.8, 19.1, 22.4, 12.0, 9.8],
    highlightIndex: 2, // Wednesday = $24.8k
    unit: 'k$'
  },

  discoveryCall: {
    title: 'Discovery Call · Northwind Co.',
    caller: 'Marcus Vance',
    callerTitle: 'VP of Operations',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    duration: '04:32',
    waveform: [25, 45, 70, 90, 60, 40, 85, 100, 75, 50, 65, 80, 95, 40, 30, 60, 85, 70, 45, 90, 65, 35, 50, 80]
  },

  customersList: [
    { id: 'c1', name: 'Arthur Pendelton', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80', company: 'Acme Corp', status: 'Active', owner: 'Alex M.', ltv: '$48,200', lastContact: '2 hrs ago' },
    { id: 'c2', name: 'Miriam Sterling', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=80', company: 'Nova Labs', status: 'Active', owner: 'Sarah C.', ltv: '$32,150', lastContact: 'Yesterday' },
    { id: 'c3', name: 'Liam Gallagher', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop&q=80', company: 'Vertex Systems', status: 'Trial', owner: 'David K.', ltv: '$8,400', lastContact: '3 days ago' },
    { id: 'c4', name: 'Chloe Dubois', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', company: 'Lumiere AI', status: 'Lead', owner: 'Elena R.', ltv: '$12,000', lastContact: 'May 12' },
    { id: 'c5', name: 'Jonathan Reeves', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80', company: 'Beacon Tech', status: 'Churned', owner: 'Alex M.', ltv: '$19,500', lastContact: 'Apr 28' },
  ],

  dealsPipeline: {
    lead: [
      { id: 'd1', title: 'Enterprise Migration', company: 'Northwind Co.', value: '$48,000', probability: '30%', ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60', tag: 'SaaS' },
      { id: 'd2', title: 'Analytics Integration', company: 'Solstice Group', value: '$18,500', probability: '40%', ownerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60', tag: 'Data' }
    ],
    qualified: [
      { id: 'd3', title: 'Global Rollout v2', company: 'Zenith Holdings', value: '$92,000', probability: '60%', ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60', tag: 'Annual' }
    ],
    proposal: [
      { id: 'd4', title: 'Dedicated Cluster SLA', company: 'Hyperion Bio', value: '$64,000', probability: '75%', ownerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60', tag: 'Cloud' }
    ],
    negotiation: [
      { id: 'd5', title: 'Multi-Seat Enterprise', company: 'Apex Global', value: '$120,000', probability: '90%', ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60', tag: 'Enterprise' }
    ],
    won: [
      { id: 'd6', title: 'Q2 Expansion Pack', company: 'Starlight Retail', value: '$55,000', probability: '100%', ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60', tag: 'Closed' }
    ]
  },

  products: [
    { id: 'p1', name: 'Enterprise Cloud Core', category: 'Infrastructure', price: '$1,499 / mo', stock: 18, maxStock: 20, active: true, gradient: 'from-blue-500 to-indigo-600', iconName: 'Box' },
    { id: 'p2', name: 'Analytics Intelligence Suite', category: 'SaaS Software', price: '$899 / mo', stock: 42, maxStock: 50, active: true, gradient: 'from-cyan-500 to-blue-600', iconName: 'BarChart3' },
    { id: 'p3', name: 'High-Speed Fiber Gate', category: 'Connectivity', price: '$499 / mo', stock: 9, maxStock: 10, active: true, gradient: 'from-emerald-500 to-teal-600', iconName: 'LayoutGrid' },
    { id: 'p4', name: '24/7 Security Vault', category: 'Compliance', price: '$1,200 / mo', stock: 15, maxStock: 15, active: false, gradient: 'from-purple-500 to-pink-600', iconName: 'ShoppingBag' }
  ]
};
