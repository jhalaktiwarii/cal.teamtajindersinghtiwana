import React from 'react';
import { CompactApprovalButtons, LargeApprovalButtons, BJPApprovalButtons, ApprovalButton, StampButton } from './approval-buttons';

export function ApprovalButtonsDemo() {
  const handleApprove = () => {
    console.log('Approve clicked');
  };

  const handleReject = () => {
    console.log('Reject clicked');
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Approval Buttons Demo</h1>
        
        {/* Compact Buttons - Status Based */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Compact Buttons - Status Based</h2>
          <p className="text-gray-600 mb-4">Professional compact buttons that adapt based on current status</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 text-green-700">Status: Scheduled</h3>
              <p className="text-sm text-gray-500 mb-2">Both buttons available for initial decision</p>
              <CompactApprovalButtons 
                onApprove={handleApprove} 
                onDecline={handleReject}
                currentStatus="scheduled"
              />
            </div>
            
            <div>
              <h3 className="font-medium mb-2 text-green-700">Status: Going (Approved)</h3>
              <p className="text-sm text-gray-500 mb-2">Approved state shown, only Reject button available</p>
              <CompactApprovalButtons 
                onApprove={handleApprove} 
                onDecline={handleReject}
                currentStatus="going"
              />
            </div>
            
            <div>
              <h3 className="font-medium mb-2 text-green-700">Status: Not Going (Rejected)</h3>
              <p className="text-sm text-gray-500 mb-2">Rejected state shown, only Approve button available</p>
              <CompactApprovalButtons 
                onApprove={handleApprove} 
                onDecline={handleReject}
                currentStatus="not-going"
              />
            </div>
          </div>
        </div>

        {/* Large Buttons - Status Based */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Large Buttons - Status Based</h2>
          <p className="text-gray-600 mb-4">Prominent buttons that adapt based on current status</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 text-green-700">Status: Scheduled</h3>
              <p className="text-sm text-gray-500 mb-2">Both buttons available for initial decision</p>
              <LargeApprovalButtons 
                onApprove={handleApprove} 
                onDecline={handleReject}
                currentStatus="scheduled"
              />
            </div>
            
            <div>
              <h3 className="font-medium mb-2 text-green-700">Status: Going (Approved)</h3>
              <p className="text-sm text-gray-500 mb-2">Approved state shown, only Reject button available</p>
              <LargeApprovalButtons 
                onApprove={handleApprove} 
                onDecline={handleReject}
                currentStatus="going"
              />
            </div>
            
            <div>
              <h3 className="font-medium mb-2 text-green-700">Status: Not Going (Rejected)</h3>
              <p className="text-sm text-gray-500 mb-2">Rejected state shown, only Approve button available</p>
              <LargeApprovalButtons 
                onApprove={handleApprove} 
                onDecline={handleReject}
                currentStatus="not-going"
              />
            </div>
          </div>
        </div>

        {/* BJP Theme Buttons */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">BJP Official Theme</h2>
          <p className="text-gray-600 mb-4">Official stamp-style buttons with BJP branding</p>
          <BJPApprovalButtons 
            onApprove={handleApprove} 
            onReject={handleReject} 
          />
        </div>

        {/* Individual Buttons */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Individual Buttons</h2>
          <p className="text-gray-600 mb-4">Individual approval buttons with different sizes</p>
          <div className="flex flex-wrap gap-4">
            <ApprovalButton type="approve" onClick={handleApprove} size="sm" />
            <ApprovalButton type="decline" onClick={handleReject} size="sm" />
            <ApprovalButton type="approve" onClick={handleApprove} size="md" />
            <ApprovalButton type="decline" onClick={handleReject} size="md" />
            <ApprovalButton type="approve" onClick={handleApprove} size="lg" />
            <ApprovalButton type="decline" onClick={handleReject} size="lg" />
          </div>
        </div>

        {/* Stamp Buttons */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Stamp Buttons</h2>
          <p className="text-gray-600 mb-4">Circular stamp-style buttons</p>
          <div className="flex flex-wrap gap-4">
            <StampButton type="approve" onClick={handleApprove} size="sm" />
            <StampButton type="decline" onClick={handleReject} size="sm" />
            <StampButton type="approve" onClick={handleApprove} size="md" />
            <StampButton type="decline" onClick={handleReject} size="md" />
            <StampButton type="approve" onClick={handleApprove} size="lg" />
            <StampButton type="decline" onClick={handleReject} size="lg" />
          </div>
        </div>

        {/* Disabled State */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Disabled State</h2>
          <p className="text-gray-600 mb-4">Buttons in disabled state</p>
          <div className="flex flex-wrap gap-4">
            <CompactApprovalButtons 
              onApprove={handleApprove} 
              onReject={handleReject} 
              disabled={true}
            />
            <LargeApprovalButtons 
              onApprove={handleApprove} 
              onReject={handleReject} 
              disabled={true}
            />
            <BJPApprovalButtons 
              onApprove={handleApprove} 
              onReject={handleReject} 
              disabled={true}
            />
          </div>
        </div>

        {/* Color Comparison */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Color Scheme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Approve Button</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm">Primary: Orange (#f97316)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded"></div>
                  <span className="text-sm">Secondary: Amber (#f59e0b)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-600 rounded"></div>
                  <span className="text-sm">Border: Orange-600 (#ea580c)</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Reject Button</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span className="text-sm">Primary: Red-600 (#dc2626)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-700 rounded"></div>
                  <span className="text-sm">Secondary: Red-700 (#b91c1c)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-700 rounded"></div>
                  <span className="text-sm">Border: Red-700 (#b91c1c)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 