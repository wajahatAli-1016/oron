import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Search, ArrowRight, Clock, Eye } from 'lucide-react';
import { Card, Button, Input, StatsCard } from '../../components/UI';
import { mockCarePlans, mockResidents } from '../../mockData';
import { getFullName } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const CarePlan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const branchId = user?.branchId || 'b1';
  const myCarePlans = mockCarePlans.filter((cp) => cp.branchId === branchId);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Combine care plan data with resident data
  const carePlansWithResidents = myCarePlans.map((cp) => {
    const resident = mockResidents.find((r) => r.id === cp.residentId);
    return {
      ...cp,
      residentName: resident ? getFullName(resident) : 'Unknown Resident',
      room: resident?.room || 'N/A',
      firstName: resident?.firstName || 'U',
      lastName: resident?.lastName || 'R'
    };
  });

  const filteredPlans = carePlansWithResidents.filter((cp) => {
    return (
      cp.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cp.room.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPlans = myCarePlans.length;
  const recentUpdates = myCarePlans.filter(
    (cp) =>
      new Date(cp.generatedDate).getTime() >
      Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  const handleViewCarePlan = (residentId: string) => {
    // Navigate with state to indicate we want the care plan tab active
    navigate(`/admin/residents/${residentId}`, { 
      state: { activeTab: 'careplan' } 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Care Plans</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage evolving care plans based on staff inputs and assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Total Care Plans"
          value={totalPlans}
          icon={ClipboardList}
          iconColor="text-brand-500"
          iconBg="bg-brand-100" />
        
        <StatsCard
          title="Recently Updated (7 days)"
          value={recentUpdates}
          icon={Clock}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-100" />
      </div>

      <Card noPadding>
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by resident or room..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="w-[400px] md:w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Resident</th>
                  <th className="px-6 py-4 font-semibold">Room</th>
                  <th className="px-6 py-4 font-semibold">Last Updated</th>
                  <th className="px-6 py-4 font-semibold">Next Review</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-xs shrink-0">
                          {plan.firstName[0]}
                          {plan.lastName[0]}
                        </div>
                        <span className="font-medium text-slate-900">
                          {plan.residentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{plan.room}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(plan.generatedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${new Date(plan.reviewDate) < new Date() ? 'text-red-600' : 'text-slate-600'}`}>
                        {new Date(plan.reviewDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={Eye}
                        onClick={() => handleViewCarePlan(plan.residentId)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredPlans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <ClipboardList className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-900">
                        No care plans found
                      </p>
                      <p className="text-sm mt-1">Try adjusting your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};