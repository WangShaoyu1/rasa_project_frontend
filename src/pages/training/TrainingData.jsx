import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Plus, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  Search,
  FileText,
  Database
} from 'lucide-react';
import { trainingAPI } from '@/lib/api';

export default function TrainingData() {
  const [data, setData] = useState([]);
  const [intents, setIntents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('');
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0 });
  
  // 对话框状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // 表单数据
  const [formData, setFormData] = useState({
    text: '',
    intent: '',
    entities: []
  });
  
  // 导入数据
  const [importData, setImportData] = useState('');
  const [importType, setImportType] = useState('json');

  useEffect(() => {
    loadData();
    loadIntents();
  }, [pagination.page, selectedIntent, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
      };
      
      if (selectedIntent) params.intent = selectedIntent;
      if (searchTerm) params.search = searchTerm;
      
      const response = await trainingAPI.getTrainingData(params);
      setData(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('加载训练数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIntents = async () => {
    try {
      const response = await trainingAPI.getIntents();
      setIntents(response.data.data);
    } catch (error) {
      console.error('加载意图列表失败:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await trainingAPI.createTrainingData(formData);
      setShowCreateDialog(false);
      setFormData({ text: '', intent: '', entities: [] });
      loadData();
    } catch (error) {
      console.error('创建训练数据失败:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await trainingAPI.updateTrainingData(editingItem.id, formData);
      setEditingItem(null);
      setFormData({ text: '', intent: '', entities: [] });
      loadData();
    } catch (error) {
      console.error('更新训练数据失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这条训练数据吗？')) return;
    
    try {
      await trainingAPI.deleteTrainingData(id);
      loadData();
    } catch (error) {
      console.error('删除训练数据失败:', error);
    }
  };

  const handleImport = async () => {
    try {
      let parsedData;
      
      if (importType === 'json') {
        parsedData = JSON.parse(importData);
      } else {
        // CSV格式处理
        parsedData = importData;
      }
      
      await trainingAPI.importTrainingData({
        type: importType,
        data: parsedData
      });
      
      setShowImportDialog(false);
      setImportData('');
      loadData();
    } catch (error) {
      console.error('导入数据失败:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await trainingAPI.exportTrainingData('json');
      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'training_data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出数据失败:', error);
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({
      text: item.text,
      intent: item.intent,
      entities: item.entities || []
    });
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">训练数据管理</h1>
        <p className="text-muted-foreground">管理RASA模型的训练数据</p>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索训练数据..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={selectedIntent} onValueChange={setSelectedIntent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择意图过滤" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部意图</SelectItem>
              {intents.map((intent) => (
                <SelectItem key={intent.id} value={intent.name}>
                  {intent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                导入
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>导入训练数据</DialogTitle>
                <DialogDescription>
                  支持JSON和CSV格式的训练数据导入
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-type">导入格式</Label>
                  <Select value={importType} onValueChange={setImportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON格式</SelectItem>
                      <SelectItem value="csv">CSV格式</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="import-data">数据内容</Label>
                  <Textarea
                    id="import-data"
                    placeholder={importType === 'json' 
                      ? '[{"text": "你好", "intent": "greet"}, ...]'
                      : 'text,intent,entities\n你好,greet,[]'
                    }
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={10}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleImport}>导入</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新增数据
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增训练数据</DialogTitle>
                <DialogDescription>
                  添加新的训练样本数据
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text">文本内容</Label>
                  <Textarea
                    id="text"
                    placeholder="输入训练文本..."
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="intent">意图</Label>
                  <Select value={formData.intent} onValueChange={(value) => setFormData(prev => ({ ...prev, intent: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择意图" />
                    </SelectTrigger>
                    <SelectContent>
                      {intents.map((intent) => (
                        <SelectItem key={intent.id} value={intent.name}>
                          {intent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>训练数据列表</span>
          </CardTitle>
          <CardDescription>
            共 {pagination.total} 条数据，第 {pagination.page} 页
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">加载中...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文本内容</TableHead>
                  <TableHead>意图</TableHead>
                  <TableHead>实体数量</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-xs truncate">{item.text}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.intent}</Badge>
                    </TableCell>
                    <TableCell>{item.entities?.length || 0}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
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
          
          {/* 分页 */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                显示 {(pagination.page - 1) * pagination.per_page + 1} 到{' '}
                {Math.min(pagination.page * pagination.per_page, pagination.total)} 条，
                共 {pagination.total} 条
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑训练数据</DialogTitle>
              <DialogDescription>
                修改训练样本的内容和标注
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-text">文本内容</Label>
                <Textarea
                  id="edit-text"
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-intent">意图</Label>
                <Select value={formData.intent} onValueChange={(value) => setFormData(prev => ({ ...prev, intent: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intents.map((intent) => (
                      <SelectItem key={intent.id} value={intent.name}>
                        {intent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
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

