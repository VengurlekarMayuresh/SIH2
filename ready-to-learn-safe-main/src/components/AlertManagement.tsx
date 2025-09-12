import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  AlertCircle,
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar as CalendarIcon,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  Info,
  Zap,
  Settings,
  Users,
  Clock,
  Target
} from 'lucide-react';
import { cn } from "@/lib/utils";

const API_BASE_URL = 'http://localhost:5001/api';

interface AlertData {
  _id: string;
  title: string;
  message: string;
  type: 'emergency' | 'warning' | 'info' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  expiresAt: string | null;
  targetAudience: 'all' | 'students' | 'specific_class';
  targetClass?: string;
  targetDivision?: string;
  createdAt: string;
  createdBy: {
    name: string;
    institutionId: string;
  };
}

interface AlertFormData {
  title: string;
  message: string;
  type: string;
  priority: string;
  expiresAt: Date | undefined;
  targetAudience: string;
  targetClass: string;
  targetDivision: string;
}

interface AlertManagementProps {
  institutionData: any;
}

const AlertManagement: React.FC<AlertManagementProps> = ({ institutionData }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [formData, setFormData] = useState<AlertFormData>({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    expiresAt: undefined,
    targetAudience: 'all',
    targetClass: '',
    targetDivision: ''
  });

  // Fetch alerts
  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      console.log('AlertManagement: Fetching alerts with token:', token ? 'exists' : 'missing');
      
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterPriority !== 'all') params.append('priority', filterPriority);

      const url = `${API_BASE_URL}/alerts?${params}`;
      console.log('AlertManagement: Making request to:', url);
      
      const response = await axios.get(
        url,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('AlertManagement: Received response:', response.data);
      setAlerts(response.data.alerts);
    } catch (err: any) {
      console.error('AlertManagement: Failed to fetch alerts:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.response?.data?.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterType, filterPriority]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        ...formData,
        expiresAt: formData.expiresAt ? formData.expiresAt.toISOString() : null
      };

      if (editingAlert) {
        // Update existing alert
        await axios.put(
          `${API_BASE_URL}/alerts/${editingAlert._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Alert updated successfully');
      } else {
        // Create new alert
        await axios.post(
          `${API_BASE_URL}/alerts`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Alert created successfully');
      }

      resetForm();
      setIsDialogOpen(false);
      fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save alert');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      expiresAt: undefined,
      targetAudience: 'all',
      targetClass: '',
      targetDivision: ''
    });
    setEditingAlert(null);
  };

  // Handle edit
  const handleEdit = (alert: AlertData) => {
    setFormData({
      title: alert.title,
      message: alert.message,
      type: alert.type,
      priority: alert.priority,
      expiresAt: alert.expiresAt ? new Date(alert.expiresAt) : undefined,
      targetAudience: alert.targetAudience,
      targetClass: alert.targetClass || '',
      targetDivision: alert.targetDivision || ''
    });
    setEditingAlert(alert);
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `${API_BASE_URL}/alerts/${alertId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Alert deleted successfully');
      fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete alert');
    }
  };

  // Toggle alert status
  const handleToggle = async (alertId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `${API_BASE_URL}/alerts/${alertId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Alert status updated');
      fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update alert');
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alert Management</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage alerts for your students
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingAlert ? 'Edit Alert' : 'Create New Alert'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Alert title..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Alert message..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select value={formData.targetAudience} onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="specific_class">Specific Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.targetAudience === 'specific_class' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetClass">Class</Label>
                    <Input
                      id="targetClass"
                      value={formData.targetClass}
                      onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
                      placeholder="Class (e.g., 10th)"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDivision">Division (Optional)</Label>
                    <Input
                      id="targetDivision"
                      value={formData.targetDivision}
                      onChange={(e) => setFormData({ ...formData, targetDivision: e.target.value })}
                      placeholder="Division (e.g., A)"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Expiry Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.expiresAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiresAt ? format(formData.expiresAt, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expiresAt}
                      onSelect={(date) => setFormData({ ...formData, expiresAt: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editingAlert ? 'Update Alert' : 'Create Alert'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="info">Information</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading && alerts.length === 0 ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert._id} className={cn("border-l-4", !alert.isActive && "opacity-60")}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-2 h-2 rounded-full mt-2", getPriorityColor(alert.priority))} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(alert.type)}
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <Badge variant={alert.isActive ? "default" : "secondary"}>
                          {alert.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {alert.type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {alert.targetAudience === 'specific_class' 
                            ? `Class ${alert.targetClass}${alert.targetDivision ? ` (${alert.targetDivision})` : ''}` 
                            : alert.targetAudience.charAt(0).toUpperCase() + alert.targetAudience.slice(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(alert.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {alert.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Expires {format(new Date(alert.expiresAt), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggle(alert._id)}
                    >
                      {alert.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(alert)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(alert._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertManagement;