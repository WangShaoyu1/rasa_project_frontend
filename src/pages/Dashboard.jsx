import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Brain, 
  Cpu, 
  Smartphone, 
  MessageSquare, 
  Activity,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { trainingAPI, rasaAPI, llmAPI, deviceAPI, chatAPI, systemAPI } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    training: null,
    devices: null,
    chat: null,
    system: { status: 'loading' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 并行加载所有统计数据
      const [trainingStats, deviceStats, chatStats, systemHealth] = await Promise.allSettled([
        trainingAPI.getStatistics(),
        deviceAPI.getStatistics(),
        chatAPI.getStatistics(),
        systemAPI.healthCheck()
      ]);

      setStats({
        training: trainingStats.status === 'fulfilled' ? trainingStats.value.data.data : null,
        devices: deviceStats.status === 'fulfilled' ? deviceStats.value.data.data : null,
        chat: chatStats.status === 'fulfilled' ? chatStats.value.data.data : null,
        system: systemHealth.status === 'fulfilled' ? { status: 'healthy' } : { status: 'error' }
      });
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, description, icon: Icon, color = "blue" }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const SystemStatusCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>系统状态</span>
        </CardTitle>
        <CardDescription>各模块运行状态监控</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">后端服务</span>
          <Badge variant={stats.system.status === 'healthy' ? 'default' : 'destructive'}>
            {stats.system.status === 'healthy' ? '正常' : '异常'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">数据库连接</span>
          <Badge variant="default">正常</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">RASA服务</span>
          <Badge variant="secondary">待检测</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">大模型服务</span>
          <Badge variant="secondary">待检测</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>快速操作</span>
        </CardTitle>
        <CardDescription>常用功能快速入口</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start" variant="outline">
          <Database className="mr-2 h-4 w-4" />
          导入训练数据
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Brain className="mr-2 h-4 w-4" />
          训练新模型
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          测试对话
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Smartphone className="mr-2 h-4 w-4" />
          设备控制
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统概览</h1>
          <p className="text-muted-foreground">智能家居语音交互系统运行状态</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统概览</h1>
          <p className="text-muted-foreground">智能家居语音交互系统运行状态</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          刷新数据
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="训练数据"
          value={stats.training?.total_training_data || 0}
          description="条训练样本"
          icon={Database}
          color="blue"
        />
        <StatCard
          title="意图数量"
          value={stats.training?.total_intents || 0}
          description="个已定义意图"
          icon={Brain}
          color="green"
        />
        <StatCard
          title="设备数量"
          value={stats.devices?.total_devices || 0}
          description="个智能设备"
          icon={Smartphone}
          color="purple"
        />
        <StatCard
          title="对话次数"
          value={stats.chat?.total_conversations || 0}
          description="次历史对话"
          icon={MessageSquare}
          color="orange"
        />
      </div>

      {/* 详细信息卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 训练数据分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>训练数据分布</span>
            </CardTitle>
            <CardDescription>各意图的训练数据数量</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.training?.intent_distribution ? (
              <div className="space-y-2">
                {Object.entries(stats.training.intent_distribution).slice(0, 5).map(([intent, count]) => (
                  <div key={intent} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{intent}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">暂无数据</p>
            )}
          </CardContent>
        </Card>

        {/* 设备状态分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>设备状态</span>
            </CardTitle>
            <CardDescription>设备在线状态分布</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.devices?.status_distribution ? (
              <div className="space-y-2">
                {Object.entries(stats.devices.status_distribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{status === 'online' ? '在线' : '离线'}</span>
                    <Badge variant={status === 'online' ? 'default' : 'secondary'}>{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">暂无数据</p>
            )}
          </CardContent>
        </Card>

        {/* 系统状态 */}
        <SystemStatusCard />
      </div>

      {/* 底部操作区域 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 快速操作 */}
        <QuickActionsCard />

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>系统信息</span>
            </CardTitle>
            <CardDescription>系统运行关键指标</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">平均置信度</span>
              <span className="text-sm text-muted-foreground">
                {stats.chat?.average_confidence ? `${(stats.chat.average_confidence * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">活跃会话</span>
              <span className="text-sm text-muted-foreground">{stats.chat?.session_count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">设备类型</span>
              <span className="text-sm text-muted-foreground">
                {stats.devices?.type_distribution ? Object.keys(stats.devices.type_distribution).length : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">覆盖位置</span>
              <span className="text-sm text-muted-foreground">
                {stats.devices?.location_distribution ? Object.keys(stats.devices.location_distribution).length : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

