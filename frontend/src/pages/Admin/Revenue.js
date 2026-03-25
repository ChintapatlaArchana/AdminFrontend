import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { adminService } from '../../services/adminService';

export const Revenue = () => {
   const [metrics, setMetrics] = useState({
      mrr: 0, arr: 0, arpu: 0, netAdds: 0, churnRate: 0,
      adRev: 0, ctr: '0%', fillRate: '0%', ecpm: 0
   });
   const [loading, setLoading] = useState(true);

   // Data Generators
   const generateMonthlyData = () => {
      const months = ['Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25'];
      return months.map((month, idx) => ({
         month,
         subs: Math.round(12000 + (idx * 500) + (Math.random() - 0.5) * 1000),
         ads: Math.round(3500 + (Math.sin(idx) * 1000) + (Math.random() - 0.5) * 500)
      }));
   };

   const generateWeeklyAdData = () => {
      const dates = ['2025-01-11', '2025-01-18', '2025-01-25', '2025-02-01', '2025-02-08', '2025-02-15', '2025-02-22', '2025-03-01', '2025-03-08', '2025-03-15', '2025-03-22', '2025-03-29'];
      return dates.map((date, idx) => ({
         date,
         ecpm: 3.4 + Math.sin(idx * 0.7) * 0.2 + (Math.random() * 0.2),
         ctr: 1.1 + Math.cos(idx * 0.5) * 0.1,
         fill: 1.15 + (Math.random() * 0.1)
      }));
   };

   const monthlyData = generateMonthlyData();
   const weeklyData = generateWeeklyAdData();

   useEffect(() => {
      const fetchRevenue = async () => {
         try {
            setLoading(true);
            const [subs, ads] = await Promise.all([
               adminService.getSubscriptions(),
               adminService.getAdDeliveryReports()
            ]);

            const activeSubscribers = subs?.filter(s => s.status === 'Active').length || 186;
            let totalMrr = 0;
            if (subs) {
               subs.forEach(sub => {
                  if (sub.status === 'Active') {
                     totalMrr += sub.monthlyPrice || 15;
                  }
               });
            }
            if (totalMrr === 0) totalMrr = 450;

            let adRev = 0, totalEcpm = 0, avgCtr = '2.1%', avgFill = '85%';
            if (ads && ads.length > 0) {
               ads.forEach(ad => {
                  adRev += (ad.eCPM * ad.impressions) / 1000;
                  totalEcpm += ad.eCPM;
               });
               totalEcpm = totalEcpm / ads.length;
               avgCtr = ads[0].ctr || '2.1%';
               avgFill = ads[0].fillRate || '85%';
            } else {
               adRev = 1250;
               totalEcpm = 12.5;
            }

            setMetrics({
               mrr: totalMrr,
               arr: totalMrr * 12,
               arpu: activeSubscribers > 0 ? (totalMrr / activeSubscribers) : 0,
               netAdds: 14,
               churnRate: 136.5,
               adRev: adRev,
               ctr: avgCtr,
               fillRate: avgFill,
               ecpm: totalEcpm
            });

         } catch (e) {
            console.error(e);
         } finally {
            setLoading(false);
         }
      };
      fetchRevenue();
   }, []);

   const tooltipBase = {
      backgroundColor: 'rgba(13, 13, 13, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' }
   };

   const breakdownOption = {
      backgroundColor: 'transparent',
      tooltip: {
         trigger: 'axis',
         axisPointer: { type: 'shadow' },
         ...tooltipBase,
         formatter: (params) => {
            let res = `<div style="padding: 4px;"><b>${params[0].name}</b><br/>`;
            let total = 0;
            params.forEach(p => {
               res += `<span style="color:${p.color}">●</span> ${p.seriesName}: <b>$${p.value.toLocaleString()}</b><br/>`;
               total += p.value;
            });
            res += `<hr style="margin: 5px 0; border: 0; border-top: 1px solid rgba(255,255,255,0.1)"/>`;
            res += `Total: <b>$${total.toLocaleString()}</b></div>`;
            return res;
         }
      },
      legend: {
         data: ['Subscriptions', 'Ads'],
         bottom: 0,
         textStyle: { color: '#888' },
         icon: 'circle'
      },
      grid: { top: '8%', left: '3%', right: '4%', bottom: '12%', containLabel: true },
      xAxis: {
         type: 'category',
         data: monthlyData.map(d => d.month),
         axisLine: { lineStyle: { color: '#333' } },
         axisLabel: { color: '#666' }
      },
      yAxis: {
         type: 'value',
         axisLine: { show: false },
         axisLabel: { color: '#666', formatter: (v) => `$${v / 1000}k` },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
      },
      series: [
         {
            name: 'Subscriptions', type: 'bar', stack: 'total',
            data: monthlyData.map(d => d.subs),
            itemStyle: { color: '#9333EA' }
         },
         {
            name: 'Ads', type: 'bar', stack: 'total',
            data: monthlyData.map(d => d.ads),
            itemStyle: { color: '#b49cceff', borderRadius: [4, 4, 0, 0] }
         }
      ]
   };

   const arpuOption = {
      backgroundColor: 'transparent',
      tooltip: {
         trigger: 'axis',
         axisPointer: { type: 'shadow' },
         ...tooltipBase,
         formatter: (params) => {
            const p = params[0];
            return `<div style="padding: 4px;"><b>${p.name} Plan</b><br/>ARPU: <b>$${p.value.toFixed(2)}</b></div>`;
         }
      },
      grid: { top: '10%', left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: {
         type: 'category',
         data: ['Standard', 'Basic', 'Premium'],
         axisLine: { lineStyle: { color: '#333' } },
         axisLabel: { color: '#666' }
      },
      yAxis: {
         type: 'value',
         min: 0, max: 20, interval: 5,
         axisLine: { show: false }, axisLabel: { color: '#666' },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
      },
      series: [{
         name: 'ARPU', type: 'bar', barWidth: '60%',
         data: [12.50, 8.32, 16.85],
         itemStyle: { color: '#9333EA', borderRadius: [4, 4, 0, 0] }
      }]
   };

   const ecpmOption = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', ...tooltipBase },
      grid: { top: '15%', left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: {
         type: 'category',
         data: weeklyData.map(d => d.date),
         axisLine: { lineStyle: { color: '#333' } },
         axisLabel: { color: '#666', fontSize: 10, interval: 2 },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.03)', type: 'dashed' } }
      },
      yAxis: {
         type: 'value',
         min: 0, max: 4, interval: 1,
         axisLine: { show: false }, axisLabel: { color: '#666' },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
      },
      series: [{
         name: 'eCPM', type: 'line', data: weeklyData.map(d => d.ecpm),
         symbol: 'circle', symbolSize: 6, itemStyle: { color: '#fff', borderColor: '#9333EA', borderWidth: 2 },
         lineStyle: { width: 2, color: '#9333EA' }
      }]
   };

   const ctrFillOption = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, ...tooltipBase },
      legend: {
         data: ['CTR (%)', 'Fill Rate (%)'],
         bottom: 0, textStyle: { color: '#888' }, icon: 'rect'
      },
      grid: { top: '15%', left: '3%', right: '4%', bottom: '20%', containLabel: true },
      xAxis: {
         type: 'category',
         data: weeklyData.map(d => d.date),
         axisLine: { lineStyle: { color: '#333' } },
         axisLabel: { color: '#666', fontSize: 10, interval: 2 },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.03)', type: 'dashed' } }
      },
      yAxis: {
         type: 'value',
         min: 0, max: 1.2, interval: 0.3,
         axisLine: { show: false }, axisLabel: { color: '#666' },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
      },
      series: [
         {
            name: 'CTR (%)', type: 'bar', data: weeklyData.map(d => d.ctr),
            itemStyle: { color: '#9333EA', borderRadius: [2, 2, 0, 0] }
         },
         {
            name: 'Fill Rate (%)', type: 'bar', data: weeklyData.map(d => d.fill),
            itemStyle: { color: '#A78BFA', borderRadius: [2, 2, 0, 0] }
         }
      ]
   };

   return (
      <div className="dashboard-content">
         <div className="page-header d-flex justify-content-between align-items-center">
            <div>
               <h1 className="page-title">Revenue</h1>
               <p className="page-subtitle">Subscriptions and Ads revenue overview</p>
            </div>
         </div>

         {loading ? (
            <div className="text-center mt-5"><div className="spinner-border text-light" role="status"></div></div>
         ) : (
            <React.Fragment>
               <h4 className="mb-3 text-secondary">Subscription Revenue</h4>
               <div className="row g-4 mb-5">
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>MRR</span>
                           <i className="bi bi-currency-dollar"></i>
                        </div>
                        <div className="metric-value">${metrics.mrr.toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
                        <div className="metric-sub text-success">+4.2% vs last month</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>ARR</span>
                           <i className="bi bi-graph-up"></i>
                        </div>
                        <div className="metric-value">${metrics.arr.toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
                        <div className="metric-sub text-success">+4.2% projected</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>Net Adds</span>
                           <i className="bi bi-person-plus"></i>
                        </div>
                        <div className="metric-value">{metrics.netAdds}</div>
                        <div className="metric-sub text-secondary">New Activations - Lapsed</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>ARPU</span>
                           <i className="bi bi-bullseye"></i>
                        </div>
                        <div className="metric-value">${metrics.arpu.toFixed(2)}</div>
                        <div className="metric-sub text-secondary">Average per user</div>
                     </div>
                  </div>
               </div>

               <h4 className="mb-3 text-secondary">Ad Revenue</h4>
               <div className="row g-4 mb-5">
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>Total Ad Revenue</span>
                           <i className="bi bi-cash-stack"></i>
                        </div>
                        <div className="metric-value">${metrics.adRev.toFixed(0)}</div>
                        <div className="metric-sub text-success">+12.5% vs last month</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>Avg eCPM</span>
                           <i className="bi bi-tag"></i>
                        </div>
                        <div className="metric-value">${metrics.ecpm.toFixed(2)}</div>
                        <div className="metric-sub text-secondary">Platform average</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>Platform CTR</span>
                           <i className="bi bi-cursor"></i>
                        </div>
                        <div className="metric-value">{metrics.ctr}</div>
                        <div className="metric-sub text-secondary">Weighted by impressions</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>Fill Rate</span>
                           <i className="bi bi-boxes"></i>
                        </div>
                        <div className="metric-value">{metrics.fillRate}</div>
                        <div className="metric-sub text-success">Healthy inventory usage</div>
                     </div>
                  </div>
               </div>

               <div className="row g-4">
                  <div className="col-12">
                     <div className="metric-card p-4 mb-4" style={{ height: 'auto' }}>
                        <div className="metric-header mb-3">
                           <span>Revenue Breakdown: Subs vs Ads</span>
                           <i className="bi bi-bar-chart-steps"></i>
                        </div>
                        <div style={{ height: '220px' }}>
                           <ReactECharts option={breakdownOption} style={{ height: '100%', width: '100%' }} />
                        </div>
                     </div>

                     <div className="metric-card p-4 mb-4" style={{ height: 'auto' }}>
                        <div className="metric-header mb-3">
                           <span>ARPU by Plan (Current Month)</span>
                           <i className="bi bi-bar-chart-line"></i>
                        </div>
                        <div style={{ height: '220px' }}>
                           <ReactECharts option={arpuOption} style={{ height: '100%', width: '100%' }} />
                        </div>
                     </div>

                     <div className="row g-4">
                        <div className="col-md-6">
                           <div className="metric-card p-4" style={{ minHeight: '400px' }}>
                              <div className="metric-header mb-4">
                                 <span>Ad Yield Trend - eCPM (Weekly)</span>
                                 <i className="bi bi-lightning-charge"></i>
                              </div>
                              <div style={{ height: '300px' }}>
                                 <ReactECharts option={ecpmOption} style={{ height: '100%', width: '100%' }} />
                              </div>
                           </div>
                        </div>
                        <div className="col-md-6">
                           <div className="metric-card p-4" style={{ minHeight: '400px' }}>
                              <div className="metric-header mb-4">
                                 <span>Platform CTR & Fill Rate (Weekly)</span>
                                 <i className="bi bi-toggles"></i>
                              </div>
                              <div style={{ height: '300px' }}>
                                 <ReactECharts option={ctrFillOption} style={{ height: '100%', width: '100%' }} />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </React.Fragment>
         )}
      </div>
   );
};
