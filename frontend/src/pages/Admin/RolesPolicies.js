import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import ReactECharts from 'echarts-for-react';
import './RolesPolicies.css';

export const RolesPolicies = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [adminStats, setAdminStats] = useState({ active: 22, inactive: 3 });
  
  // Chart Data
  const roleDistribution = [
    { name: 'Viewer/Subscriber', value: 850 },
    { name: 'Platform Operator', value: 50 },
    { name: 'Content Editor', value: 45 },
    { name: 'Ad Ops/Sales', value: 30 },
    { name: 'Media Admin', value: 25 }
  ];

  const entitlementScopeData = [
    { name: 'All Content', value: 70 },
    { name: 'Category', value: 20 },
    { name: 'Title Only', value: 10 }
  ];

  const driftData = [
    { name: 'User2Name', email: 'user2@example.com', scope: 'Category', granted: '2024-10-20', expiry: '2025-07-20' },
    { name: 'User6Name', email: 'user6@example.com', scope: 'Title', granted: '2024-06-19', expiry: '2024-12-19' },
    { name: 'User12Name', email: 'user12@example.com', scope: 'Category', granted: '2024-04-06', expiry: '2025-05-06' },
    { name: 'User19Name', email: 'user19@example.com', scope: 'Category', granted: '2024-11-25', expiry: '2025-02-25' },
    { name: 'User20Name', email: 'user20@example.com', scope: 'Category', granted: '2024-09-05', expiry: '2025-08-05' },
    { name: 'User21Name', email: 'user21@example.com', scope: 'Title', granted: '2024-05-11', expiry: '2025-05-11' },
    { name: 'User22Name', email: 'user22@example.com', scope: 'Title', granted: '2024-11-17', expiry: '2025-09-17' },
    { name: 'User36Name', email: 'user36@example.com', scope: 'Title', granted: '2024-02-09', expiry: '2024-04-09' },
    { name: 'User39Name', email: 'user39@example.com', scope: 'Title', granted: '2024-04-15', expiry: '2024-11-15' },
    { name: 'User54Name', email: 'user54@example.com', scope: 'Title', granted: '2024-04-06', expiry: '2024-09-06' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const count = await adminService.getTotalUserCount();
        setTotalUsers(count || 1024);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ECharts Options
  const barOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#888' } },
    yAxis: { 
      type: 'category', 
      data: roleDistribution.map(d => d.name).reverse(), 
      axisLabel: { color: '#ccc', fontSize: 11 },
      axisLine: { lineStyle: { color: '#333' } }
    },
    series: [{
      name: 'Users',
      type: 'bar',
      data: roleDistribution.map(d => d.value).reverse(),
      itemStyle: { color: '#9333EA', borderRadius: [0, 4, 4, 0] },
      barWidth: '60%'
    }]
  };

  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '5%', left: 'center', textStyle: { color: '#aaa' } },
    series: [{
      name: 'Entitlement Scope',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#06060c', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' } },
      data: entitlementScopeData.map((d, i) => ({
        ...d,
        itemStyle: { color: i === 0 ? '#9333EA' : i === 1 ? '#C084FC' : '#E879F9' }
      }))
    }]
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">Roles & Policies</h1>
        <p className="page-subtitle">RBAC Governance and Entitlements</p>
      </div>

      <div className="row g-4 mb-4">
        {/* Metric Cards */}
        <div className="col-md-4">
          <div className="metric-card">
            <div className="metric-header text-secondary mb-1">
              <span>Admin Accounts</span>
              <i className="bi bi-shield-lock"></i>
            </div>
            <div className="d-flex align-items-baseline">
                <div className="metric-value me-2">{adminStats.active + adminStats.inactive}</div>
                <div className="metric-sub">Total</div>
            </div>
            <div className="mt-3 small">
              <span className="text-success me-3"><i className="bi bi-circle-fill me-1" style={{fontSize: '7px'}}></i> {adminStats.active} Active</span>
              <span className="text-danger"><i className="bi bi-circle-fill me-1" style={{fontSize: '7px'}}></i> {adminStats.inactive} Inactive</span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="metric-card">
            <div className="metric-header text-secondary mb-1">
              <span>Total Users</span>
              <i className="bi bi-people"></i>
            </div>
            <div className="metric-value total-users">{totalUsers.toLocaleString()}</div>
            <div className="metric-sub mt-2">Platform population</div>
          </div>
        </div>

        <div className="col-md-4">
           <div className="metric-card">
            <div className="metric-header text-secondary mb-1">
              <span>Expiring Special Grants</span>
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div className="mt-2">
               <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>&lt; 7 Days</span>
                  <span className="text-danger fw-bold">12</span>
               </div>
               <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>7-30 Days</span>
                  <span className="text-warning fw-bold">34</span>
               </div>
               <div className="d-flex justify-content-between text-secondary small">
                  <span>&gt; 30 Days</span>
                  <span className="text-success fw-bold">89</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 charts-row">
        <div className="col-md-6">
          <div className="chart-container-card">
            <div className="chart-header">
              <h4 className="chart-title">Users by Role</h4>
              <i className="bi bi-person-badge"></i>
            </div>
            <div style={{ height: '300px' }}>
              <ReactECharts option={barOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="chart-container-card">
            <div className="chart-header">
              <h4 className="chart-title">Entitlement Scope</h4>
              <i className="bi bi-pie-chart"></i>
            </div>
            <div style={{ height: '300px' }}>
              <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Policy Drift Section */}
      <div className="policy-drift-section">
        <h2 className="section-label">Policy Drift - Special Access Grants</h2>
        <p className="section-sublabel">Users with custom entitlements (not following default plan scope)</p>
        
        <div className="drift-card">
          <div className="table-responsive">
            <table className="drift-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Content Scope</th>
                  <th>Granted Date</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {driftData.map((user, idx) => (
                  <tr key={idx}>
                    <td className="user-name-cell">{user.name}</td>
                    <td className="email-cell">{user.email}</td>
                    <td>
                      <span className={`badge-mt badge-${user.scope.toLowerCase()}`}>
                        {user.scope}
                      </span>
                    </td>
                    <td className="date-cell">{user.granted}</td>
                    <td className="date-cell">{user.expiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
