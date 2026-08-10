import React from 'react';
import { FileText, Edit, Eye, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function CMS() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <FileText className="mr-2 text-brand-600" /> Content Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage static pages, blogs, and legal documents.</p>
        </div>
        <Button variant="primary" size="sm">Create Page</Button>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="border-b border-gray-50">
          <CardTitle>Published Pages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {/* Page 1 */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded text-gray-500"><Globe size={20} /></div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Terms of Service</h4>
                  <p className="text-xs text-slate-500 mt-0.5">/legal/terms • Last updated 2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="success">Published</Badge>
                <div className="flex space-x-2">
                  <button className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"><Eye size={16} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={16} /></button>
                </div>
              </div>
            </div>

            {/* Page 2 */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded text-gray-500"><Globe size={20} /></div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Privacy Policy</h4>
                  <p className="text-xs text-slate-500 mt-0.5">/legal/privacy • Last updated 1 month ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="success">Published</Badge>
                <div className="flex space-x-2">
                  <button className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"><Eye size={16} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={16} /></button>
                </div>
              </div>
            </div>

            {/* Page 3 */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded text-gray-500"><Globe size={20} /></div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">About Us</h4>
                  <p className="text-xs text-slate-500 mt-0.5">/about • Last updated 3 months ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="warning">Draft</Badge>
                <div className="flex space-x-2">
                  <button className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"><Eye size={16} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
