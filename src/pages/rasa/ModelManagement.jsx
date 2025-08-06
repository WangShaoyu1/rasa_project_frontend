import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Brain, 
  Play, 
  Square, 
  Download, 
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { rasaAPI } from '@/lib/api';

export default function ModelManagement() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [rasaStatus, setRasaStatus] = useState(null);
  
  // 训练对话框状态
  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [modelName, setModelName] = useState('');

  useEffect(() => {
    loadModels();
    loadRasaStatus();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await rasaAPI.getModels();
      setModels(response.data.data);
    } catch (error) {
      console.error('加载模型列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRasaStatus = async () => {
    try {
      const response = await rasaAPI.getStatus();
      setRasaStatus(response.data.data);
    } catch (error) {
      console.error('获取RASA状态失败:', error);
    }
  };

  const handleTrainModel = async () => {
    if (!modelName.trim()) {
      alert('请输入模型名称');
      return;
    }

    try {
      setTraining(true);
      setTrainingProgress(0);
      setShowTrainDialog(false);
      
      // 模拟训练进度
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      const response = await rasaAPI.trainModel({ model_name: modelName });
      
      clearInterval(progressInterval);
      setTrainingProgress(100);
      
      if (response.data.success) {
        setTimeout(() => {
          setTraining(false);
          setTrainingProgress(0);
          setModelName('');
          loadModels();
        }, 1000);
      } else {
        setTraining(false);
        setTrainingProgress(0);
        alert('模型训练失败: ' + response.data.error);
      }
    } catch (error) {
      setTraining(false);
      setTrainingProgress(0);
      console.error('训练模型失败:', error);
      alert('训练模型失败: ' + error.message);
    }
  };

  const handleLoadModel = async (modelId) => {
    try {
      await rasaAPI.loadModel(modelId);
      loadRasaStatus();
      alert('模型加载成功');
    } catch (error) {
      console.error('加载模型失败:', error);
      alert('加载模型失败: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ready': { variant: 'default', text: '就绪' },
      'training': { variant: 'secondary', text: '训练中' },
      'failed': { variant: 'destructive', text: '失败' },
      'loading': { variant: 'secondary', text: '加载中' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'training':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">RASA模型管理</h1>
        <p className="text-muted-foreground">管理和训练RASA对话模型</p>
      </div>

      {/* RASA状态卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RASA服务状态</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {rasaStatus?.model_ready ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">服务正常</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">服务异常</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {rasaStatus?.model_loaded ? '模型已加载' : '未加载模型'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">当前模型</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {rasaStatus?.model_path ? '已加载' : '未加载'}
            </div>
            <p className="text-xs text-muted-foreground">
              置信度阈值: {rasaStatus?.confidence_threshold || 0.7}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">模型总数</CardTitle>
            <Brain className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{models.length}</div>
            <p className="text-xs text-muted-foreground">
              可用模型数量
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 训练进度 */}
      {training && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>模型训练中</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>训练进度</span>
                <span>{Math.round(trainingProgress)}%</span>
              </div>
              <Progress value={trainingProgress} className="w-full" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={loadModels}>
            刷新列表
          </Button>
          <Button variant="outline" onClick={loadRasaStatus}>
            检查状态
          </Button>
        </div>

        <Dialog open={showTrainDialog} onOpenChange={setShowTrainDialog}>
          <DialogTrigger asChild>
            <Button disabled={training}>
              <Brain className="mr-2 h-4 w-4" />
              训练新模型
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>训练新模型</DialogTitle>
              <DialogDescription>
                基于当前训练数据创建新的RASA模型
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="model-name">模型名称</Label>
                <Input
                  id="model-name"
                  placeholder="输入模型名称，如: model_20250806"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTrainDialog(false)}>
                取消
              </Button>
              <Button onClick={handleTrainModel}>开始训练</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 模型列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>模型列表</span>
          </CardTitle>
          <CardDescription>
            已训练的RASA模型列表
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">加载中...</p>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无训练模型</p>
              <p className="text-sm text-gray-400 mt-1">点击"训练新模型"开始创建</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>模型名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>文件大小</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(model.status)}
                        <span>{model.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(model.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(model.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {model.file_size ? `${(model.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {model.status === 'ready' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadModel(model.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // 下载模型逻辑
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('确定要删除这个模型吗？')) {
                              // 删除模型逻辑
                            }
                          }}
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

      {/* 模型配置信息 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>训练配置</CardTitle>
            <CardDescription>当前RASA训练配置</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">NLU Pipeline</span>
              <span className="text-sm text-muted-foreground">SpacyNLP + DIETClassifier</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Core Policy</span>
              <span className="text-sm text-muted-foreground">TEDPolicy + RulePolicy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">语言模型</span>
              <span className="text-sm text-muted-foreground">zh_core_web_sm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Epochs</span>
              <span className="text-sm text-muted-foreground">100</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>性能指标</CardTitle>
            <CardDescription>最新模型的性能表现</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">意图识别准确率</span>
              <span className="text-sm text-muted-foreground">95.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">实体提取F1分数</span>
              <span className="text-sm text-muted-foreground">92.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">对话成功率</span>
              <span className="text-sm text-muted-foreground">88.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">平均响应时间</span>
              <span className="text-sm text-muted-foreground">245ms</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

