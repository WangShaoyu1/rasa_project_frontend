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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Cpu, 
  Plus, 
  Edit, 
  Trash2, 
  TestTube,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
  RefreshCw
} from 'lucide-react';
import { llmAPI } from '@/lib/api';

export default function LLMConfig() {
  const [configs, setConfigs] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [llmStatus, setLlmStatus] = useState(null);
  
  // 对话框状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  
  // 表单数据
  const [formData, setFormData] = useState({
    provider: '',
    model_name: '',
    api_key: '',
    base_url: '',
    is_active: true,
    priority: 10
  });
  
  // 测试数据
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadConfigs();
    loadProviders();
    loadLlmStatus();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await llmAPI.getConfigs();
      setConfigs(response.data.data);
    } catch (error) {
      console.error('加载大模型配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await llmAPI.getProviders();
      setProviders(response.data.data);
    } catch (error) {
      console.error('加载提供商列表失败:', error);
    }
  };

  const loadLlmStatus = async () => {
    try {
      const response = await llmAPI.getStatus();
      setLlmStatus(response.data.data);
    } catch (error) {
      console.error('获取大模型状态失败:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await llmAPI.createConfig(formData);
      setShowCreateDialog(false);
      resetForm();
      loadConfigs();
      loadLlmStatus();
    } catch (error) {
      console.error('创建配置失败:', error);
      alert('创建配置失败: ' + error.message);
    }
  };

  const handleUpdate = async () => {
    try {
      await llmAPI.updateConfig(editingConfig.id, formData);
      setEditingConfig(null);
      resetForm();
      loadConfigs();
      loadLlmStatus();
    } catch (error) {
      console.error('更新配置失败:', error);
      alert('更新配置失败: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个配置吗？')) return;
    
    try {
      await llmAPI.deleteConfig(id);
      loadConfigs();
      loadLlmStatus();
    } catch (error) {
      console.error('删除配置失败:', error);
      alert('删除配置失败: ' + error.message);
    }
  };

  const handleToggle = async (id) => {
    try {
      await llmAPI.toggleConfig(id);
      loadConfigs();
      loadLlmStatus();
    } catch (error) {
      console.error('切换配置状态失败:', error);
      alert('切换配置状态失败: ' + error.message);
    }
  };

  const handleTest = async () => {
    if (!testText.trim()) {
      alert('请输入测试文本');
      return;
    }

    try {
      setTesting(true);
      const response = await llmAPI.testLLM({ text: testText });
      setTestResult(response.data.data);
    } catch (error) {
      console.error('测试失败:', error);
      setTestResult({ error: error.message });
    } finally {
      setTesting(false);
    }
  };

  const handleReload = async () => {
    try {
      await llmAPI.reloadConfigs();
      loadLlmStatus();
      alert('配置重新加载成功');
    } catch (error) {
      console.error('重新加载配置失败:', error);
      alert('重新加载配置失败: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      provider: '',
      model_name: '',
      api_key: '',
      base_url: '',
      is_active: true,
      priority: 10
    });
  };

  const startEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      provider: config.provider,
      model_name: config.model_name,
      api_key: config.api_key,
      base_url: config.base_url,
      is_active: config.is_active,
      priority: config.priority
    });
  };

  const getProviderInfo = (providerName) => {
    return providers.find(p => p.name === providerName) || {};
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge variant="default">激活</Badge>
    ) : (
      <Badge variant="secondary">停用</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">大模型配置</h1>
        <p className="text-muted-foreground">管理多厂商大模型接入配置</p>
      </div>

      {/* 状态概览 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">激活配置</CardTitle>
            <Cpu className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {llmStatus?.active_configs_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              个可用配置
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">支持厂商</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length}</div>
            <p className="text-xs text-muted-foreground">
              个大模型厂商
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总配置数</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs.length}</div>
            <p className="text-xs text-muted-foreground">
              个配置项
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">服务状态</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">正常</span>
            </div>
            <p className="text-xs text-muted-foreground">
              大模型服务运行正常
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 激活的提供商 */}
      {llmStatus?.active_providers && llmStatus.active_providers.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>当前激活的大模型提供商</AlertTitle>
          <AlertDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              {llmStatus.active_providers.map((provider) => (
                <Badge key={provider} variant="outline">{provider}</Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={loadConfigs}>
            刷新列表
          </Button>
          <Button variant="outline" onClick={handleReload}>
            <RefreshCw className="mr-2 h-4 w-4" />
            重新加载配置
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <TestTube className="mr-2 h-4 w-4" />
                测试大模型
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>测试大模型</DialogTitle>
                <DialogDescription>
                  测试大模型的响应能力
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-text">测试文本</Label>
                  <Input
                    id="test-text"
                    placeholder="输入测试文本，如：打开客厅灯"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                  />
                </div>
                
                {testResult && (
                  <div className="space-y-2">
                    <Label>测试结果</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      {testResult.error ? (
                        <p className="text-red-600">错误: {testResult.error}</p>
                      ) : (
                        <div className="space-y-2">
                          <p><strong>响应:</strong> {testResult.response}</p>
                          <p><strong>使用模型:</strong> {testResult.model_used}</p>
                          <p><strong>置信度:</strong> {testResult.confidence}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                  关闭
                </Button>
                <Button onClick={handleTest} disabled={testing}>
                  {testing ? '测试中...' : '开始测试'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新增配置
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增大模型配置</DialogTitle>
                <DialogDescription>
                  添加新的大模型提供商配置
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="provider">提供商</Label>
                  <Select value={formData.provider} onValueChange={(value) => {
                    const provider = getProviderInfo(value);
                    setFormData(prev => ({ 
                      ...prev, 
                      provider: value,
                      base_url: provider.default_base_url || ''
                    }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择提供商" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.name} value={provider.name}>
                          {provider.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="model-name">模型名称</Label>
                  <Select value={formData.model_name} onValueChange={(value) => setFormData(prev => ({ ...prev, model_name: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.provider && getProviderInfo(formData.provider).models?.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="输入API密钥"
                    value={formData.api_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input
                    id="base-url"
                    placeholder="API基础URL"
                    value={formData.base_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">优先级</Label>
                  <Input
                    id="priority"
                    type="number"
                    placeholder="优先级 (1-100)"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 10 }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is-active">立即激活</Label>
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

      {/* 配置列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="h-5 w-5" />
            <span>配置列表</span>
          </CardTitle>
          <CardDescription>
            已配置的大模型提供商列表
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">加载中...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-8">
              <Cpu className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无大模型配置</p>
              <p className="text-sm text-gray-400 mt-1">点击"新增配置"开始添加</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>提供商</TableHead>
                  <TableHead>模型名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span>{getProviderInfo(config.provider).display_name || config.provider}</span>
                      </div>
                    </TableCell>
                    <TableCell>{config.model_name}</TableCell>
                    <TableCell>
                      {getStatusBadge(config.is_active)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{config.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(config.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Switch
                          checked={config.is_active}
                          onCheckedChange={() => handleToggle(config.id)}
                          size="sm"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(config)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(config.id)}
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

      {/* 编辑对话框 */}
      {editingConfig && (
        <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑大模型配置</DialogTitle>
              <DialogDescription>
                修改大模型提供商配置信息
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-provider">提供商</Label>
                <Input
                  id="edit-provider"
                  value={getProviderInfo(formData.provider).display_name || formData.provider}
                  disabled
                />
              </div>
              
              <div>
                <Label htmlFor="edit-model-name">模型名称</Label>
                <Input
                  id="edit-model-name"
                  value={formData.model_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-api-key">API Key</Label>
                <Input
                  id="edit-api-key"
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-base-url">Base URL</Label>
                <Input
                  id="edit-base-url"
                  value={formData.base_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-priority">优先级</Label>
                <Input
                  id="edit-priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 10 }))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="edit-is-active">激活状态</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingConfig(null)}>
                取消
              </Button>
              <Button onClick={handleUpdate}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

