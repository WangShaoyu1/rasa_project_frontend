import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Smartphone, 
  Plus, 
  Edit, 
  Trash2, 
  Power,
  Lightbulb,
  Wind,
  Thermometer,
  Volume2,
  Tv,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { deviceAPI } from '@/lib/api';

const deviceTypeIcons = {
  light: Lightbulb,
  air_conditioner: Wind,
  curtain: Smartphone,
  speaker: Volume2,
  tv: Tv,
  sensor: Thermometer
};

const deviceTypeNames = {
  light: '灯光',
  air_conditioner: '空调',
  curtain: '窗帘',
  speaker: '音响',
  tv: '电视',
  sensor: '传感器'
};

export default function DeviceManagement() {
  const [devices, setDevices] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 过滤和搜索
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // 对话框状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showControlDialog, setShowControlDialog] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [controllingDevice, setControllingDevice] = useState(null);
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    description: '',
    is_online: true
  });
  
  // 控制数据
  const [controlData, setControlData] = useState({
    action: '',
    value: ''
  });

  useEffect(() => {
    loadDevices();
    loadDeviceTypes();
    loadLocations();
    loadStatistics();
  }, [selectedType, selectedLocation, selectedStatus, searchTerm]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedType) params.type = selectedType;
      if (selectedLocation) params.location = selectedLocation;
      if (selectedStatus) params.status = selectedStatus;
      if (searchTerm) params.search = searchTerm;
      
      const response = await deviceAPI.getDevices(params);
      setDevices(response.data.data);
    } catch (error) {
      console.error('加载设备列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeviceTypes = async () => {
    try {
      const response = await deviceAPI.getDeviceTypes();
      setDeviceTypes(response.data.data);
    } catch (error) {
      console.error('加载设备类型失败:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await deviceAPI.getLocations();
      setLocations(response.data.data);
    } catch (error) {
      console.error('加载位置列表失败:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await deviceAPI.getStatistics();
      setStatistics(response.data.data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await deviceAPI.createDevice(formData);
      setShowCreateDialog(false);
      resetForm();
      loadDevices();
      loadStatistics();
    } catch (error) {
      console.error('创建设备失败:', error);
      alert('创建设备失败: ' + error.message);
    }
  };

  const handleUpdate = async () => {
    try {
      await deviceAPI.updateDevice(editingDevice.id, formData);
      setEditingDevice(null);
      resetForm();
      loadDevices();
      loadStatistics();
    } catch (error) {
      console.error('更新设备失败:', error);
      alert('更新设备失败: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个设备吗？')) return;
    
    try {
      await deviceAPI.deleteDevice(id);
      loadDevices();
      loadStatistics();
    } catch (error) {
      console.error('删除设备失败:', error);
      alert('删除设备失败: ' + error.message);
    }
  };

  const handleControl = async () => {
    try {
      await deviceAPI.controlDeviceById(controllingDevice.id, controlData);
      setShowControlDialog(false);
      setControllingDevice(null);
      setControlData({ action: '', value: '' });
      loadDevices();
      alert('设备控制成功');
    } catch (error) {
      console.error('设备控制失败:', error);
      alert('设备控制失败: ' + error.message);
    }
  };

  const handleInitialize = async () => {
    if (!confirm('确定要初始化默认设备吗？这将创建一些示例设备。')) return;
    
    try {
      await deviceAPI.initializeDevices();
      loadDevices();
      loadStatistics();
      alert('设备初始化成功');
    } catch (error) {
      console.error('设备初始化失败:', error);
      alert('设备初始化失败: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      location: '',
      description: '',
      is_online: true
    });
  };

  const startEdit = (device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      type: device.type,
      location: device.location,
      description: device.description || '',
      is_online: device.is_online
    });
  };

  const startControl = (device) => {
    setControllingDevice(device);
    setControlData({ action: '', value: '' });
    setShowControlDialog(true);
  };

  const getDeviceIcon = (type) => {
    const Icon = deviceTypeIcons[type] || Smartphone;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusBadge = (isOnline) => {
    return isOnline ? (
      <Badge variant="default">在线</Badge>
    ) : (
      <Badge variant="secondary">离线</Badge>
    );
  };

  const getDeviceActions = (type) => {
    const actions = {
      light: [
        { value: 'turn_on', label: '打开' },
        { value: 'turn_off', label: '关闭' },
        { value: 'set_brightness', label: '调节亮度' }
      ],
      air_conditioner: [
        { value: 'turn_on', label: '打开' },
        { value: 'turn_off', label: '关闭' },
        { value: 'set_temperature', label: '设置温度' }
      ],
      curtain: [
        { value: 'open', label: '打开' },
        { value: 'close', label: '关闭' },
        { value: 'set_position', label: '设置位置' }
      ],
      speaker: [
        { value: 'turn_on', label: '打开' },
        { value: 'turn_off', label: '关闭' },
        { value: 'set_volume', label: '调节音量' }
      ],
      tv: [
        { value: 'turn_on', label: '打开' },
        { value: 'turn_off', label: '关闭' },
        { value: 'change_channel', label: '换台' }
      ]
    };
    return actions[type] || [];
  };

  const filteredDevices = devices.filter(device => {
    return (!searchTerm || device.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
           (!selectedType || device.type === selectedType) &&
           (!selectedLocation || device.location === selectedLocation) &&
           (!selectedStatus || (selectedStatus === 'online' ? device.is_online : !device.is_online));
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">设备管理</h1>
        <p className="text-muted-foreground">管理智能家居设备和控制</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总设备数</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total_devices || 0}</div>
            <p className="text-xs text-muted-foreground">
              个智能设备
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在线设备</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.status_distribution?.online || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              个设备在线
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">设备类型</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.type_distribution ? Object.keys(statistics.type_distribution).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              种设备类型
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">覆盖位置</CardTitle>
            <Smartphone className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.location_distribution ? Object.keys(statistics.location_distribution).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              个房间位置
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 过滤和搜索栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索设备..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="设备类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部类型</SelectItem>
              {deviceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {deviceTypeNames[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="位置" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部位置</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="online">在线</SelectItem>
              <SelectItem value="offline">离线</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleInitialize}>
            初始化设备
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新增设备
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增设备</DialogTitle>
                <DialogDescription>
                  添加新的智能家居设备
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">设备名称</Label>
                  <Input
                    id="name"
                    placeholder="输入设备名称"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">设备类型</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择设备类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {deviceTypeNames[type] || type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location">位置</Label>
                  <Input
                    id="location"
                    placeholder="输入设备位置，如：客厅"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Input
                    id="description"
                    placeholder="设备描述（可选）"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-online"
                    checked={formData.is_online}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_online: checked }))}
                  />
                  <Label htmlFor="is-online">设备在线</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleCreate}>创建</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 设备列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>设备列表</span>
          </CardTitle>
          <CardDescription>
            共 {filteredDevices.length} 个设备
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">加载中...</p>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无设备</p>
              <p className="text-sm text-gray-400 mt-1">点击"新增设备"或"初始化设备"开始添加</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>设备名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>位置</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最后更新</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(device.type)}
                        <span>{device.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {deviceTypeNames[device.type] || device.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>
                      {getStatusBadge(device.is_online)}
                    </TableCell>
                    <TableCell>
                      {new Date(device.updated_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startControl(device)}
                          disabled={!device.is_online}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(device)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(device.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 编辑设备对话框 */}
      {editingDevice && (
        <Dialog open={!!editingDevice} onOpenChange={() => setEditingDevice(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑设备</DialogTitle>
              <DialogDescription>
                修改设备信息和配置
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">设备名称</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-type">设备类型</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {deviceTypeNames[type] || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-location">位置</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">描述</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is-online"
                  checked={formData.is_online}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_online: checked }))}
                />
                <Label htmlFor="edit-is-online">设备在线</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingDevice(null)}>
                取消
              </Button>
              <Button onClick={handleUpdate}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 设备控制对话框 */}
      {controllingDevice && (
        <Dialog open={showControlDialog} onOpenChange={setShowControlDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>控制设备</DialogTitle>
              <DialogDescription>
                控制 {controllingDevice.name} ({deviceTypeNames[controllingDevice.type]})
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="action">控制动作</Label>
                <Select value={controlData.action} onValueChange={(value) => setControlData(prev => ({ ...prev, action: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择控制动作" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDeviceActions(controllingDevice.type).map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {controlData.action && ['set_brightness', 'set_temperature', 'set_position', 'set_volume'].includes(controlData.action) && (
                <div>
                  <Label htmlFor="value">设置值</Label>
                  <Input
                    id="value"
                    placeholder={
                      controlData.action === 'set_brightness' ? '亮度 (0-100)' :
                      controlData.action === 'set_temperature' ? '温度 (16-30)' :
                      controlData.action === 'set_position' ? '位置 (0-100)' :
                      controlData.action === 'set_volume' ? '音量 (0-100)' : '值'
                    }
                    value={controlData.value}
                    onChange={(e) => setControlData(prev => ({ ...prev, value: e.target.value }))}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowControlDialog(false)}>
                取消
              </Button>
              <Button onClick={handleControl}>执行控制</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

