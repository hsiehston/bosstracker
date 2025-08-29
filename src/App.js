import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, MapPin, Sword, AlertCircle, ChevronDown, ChevronRight, Book } from 'lucide-react';

const BossTracker = () => {
  const [episodes, setEpisodes] = useState([
    {
      id: 1,
      name: 'Episode 1',
      maps: [
        {
          id: 1,
          name: 'Map 1',
          bosses: [
            {
              id: 1,
              name: '炎龍王',
              respawnInterval: 180,
              lastKilledTime: null,
              nextSpawnTime: null,
              isActive: false
            }
          ]
        },
        {
          id: 2,
          name: 'Map 2',
          bosses: [
            {
              id: 2,
              name: '冰雪女王',
              respawnInterval: 240,
              lastKilledTime: Date.now() - (120 * 60 * 1000),
              nextSpawnTime: Date.now() + (120 * 60 * 1000),
              isActive: true
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Episode 2',
      maps: [
        {
          id: 3,
          name: 'Map 1',
          bosses: [
            {
              id: 3,
              name: '暗影領主',
              respawnInterval: 300,
              lastKilledTime: null,
              nextSpawnTime: null,
              isActive: false
            }
          ]
        }
      ]
    }
  ]);

  const [expandedEpisodes, setExpandedEpisodes] = useState({ 1: true });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBoss, setEditingBoss] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState('');
  const [selectedMap, setSelectedMap] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 表單狀態
  const [formData, setFormData] = useState({
    episodeName: '',
    mapName: '',
    bossName: '',
    respawnInterval: 180
  });

  // 每秒更新當前時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 格式化時間顯示
  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds <= 0) return '已重生';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}時${minutes}分${seconds}秒`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  // 格式化日期時間
  const formatDateTime = (timestamp) => {
    if (!timestamp) return '未設定';
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 切換章節展開/收合
  const toggleEpisode = (episodeId) => {
    setExpandedEpisodes(prev => ({
      ...prev,
      [episodeId]: !prev[episodeId]
    }));
  };

  // 新增頭目
  const addBoss = () => {
    if (formData.bossName.trim() === '' || formData.episodeName.trim() === '' || formData.mapName.trim() === '') return;

    const newBossId = Date.now();
    const newBoss = {
      id: newBossId,
      name: formData.bossName,
      respawnInterval: formData.respawnInterval,
      lastKilledTime: null,
      nextSpawnTime: null,
      isActive: false
    };

    setEpisodes(prev => {
      const updatedEpisodes = [...prev];
      let targetEpisode = updatedEpisodes.find(ep => ep.name === formData.episodeName);
      
      if (!targetEpisode) {
        // 創建新章節
        targetEpisode = {
          id: Date.now(),
          name: formData.episodeName,
          maps: []
        };
        updatedEpisodes.push(targetEpisode);
      }

      let targetMap = targetEpisode.maps.find(map => map.name === formData.mapName);
      
      if (!targetMap) {
        // 創建新地圖
        targetMap = {
          id: Date.now() + 1,
          name: formData.mapName,
          bosses: []
        };
        targetEpisode.maps.push(targetMap);
      }

      targetMap.bosses.push(newBoss);
      return updatedEpisodes;
    });

    setFormData({ episodeName: '', mapName: '', bossName: '', respawnInterval: 180 });
    setShowAddForm(false);
  };

  // 記錄頭目被擊敗
  const markBossKilled = (episodeId, mapId, bossId) => {
    const now = Date.now();
    setEpisodes(prev => 
      prev.map(episode => 
        episode.id === episodeId 
          ? {
              ...episode,
              maps: episode.maps.map(map => 
                map.id === mapId 
                  ? {
                      ...map,
                      bosses: map.bosses.map(boss => 
                        boss.id === bossId 
                          ? {
                              ...boss,
                              lastKilledTime: now,
                              nextSpawnTime: now + (boss.respawnInterval * 60 * 1000),
                              isActive: true
                            }
                          : boss
                      )
                    }
                  : map
              )
            }
          : episode
      )
    );
  };

  // 重置頭目狀態
  const resetBoss = (episodeId, mapId, bossId) => {
    setEpisodes(prev => 
      prev.map(episode => 
        episode.id === episodeId 
          ? {
              ...episode,
              maps: episode.maps.map(map => 
                map.id === mapId 
                  ? {
                      ...map,
                      bosses: map.bosses.map(boss => 
                        boss.id === bossId 
                          ? {
                              ...boss,
                              lastKilledTime: null,
                              nextSpawnTime: null,
                              isActive: false
                            }
                          : boss
                      )
                    }
                  : map
              )
            }
          : episode
      )
    );
  };

  // 刪除頭目
  const deleteBoss = (episodeId, mapId, bossId) => {
    setEpisodes(prev => 
      prev.map(episode => 
        episode.id === episodeId 
          ? {
              ...episode,
              maps: episode.maps.map(map => 
                map.id === mapId 
                  ? {
                      ...map,
                      bosses: map.bosses.filter(boss => boss.id !== bossId)
                    }
                  : map
              )
            }
          : episode
      )
    );
  };

  // 取消表單
  const cancelForm = () => {
    setShowAddForm(false);
    setEditingBoss(null);
    setFormData({ episodeName: '', mapName: '', bossName: '', respawnInterval: 180 });
  };

  // 計算統計資訊
  const getStats = () => {
    let totalBosses = 0;
    let activeBosses = 0;
    let spawnedBosses = 0;

    episodes.forEach(episode => {
      episode.maps.forEach(map => {
        totalBosses += map.bosses.length;
        map.bosses.forEach(boss => {
          if (boss.isActive) {
            activeBosses++;
            const timeRemaining = boss.nextSpawnTime - currentTime;
            if (timeRemaining <= 0) spawnedBosses++;
          }
        });
      });
    });

    return { totalBosses, activeBosses, spawnedBosses };
  };

  const stats = getStats();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      {/* 標題和統計 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sword className="w-8 h-8 text-red-500" />
          MMORPG 頭目追蹤器
        </h1>
        <p className="text-gray-400 mb-4">按章節和地圖分類追蹤頭目重生時間</p>
        
        {/* 統計資訊 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-sm text-gray-400">總頭目數</div>
            <div className="text-xl font-bold text-blue-400">{stats.totalBosses}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-sm text-gray-400">追蹤中</div>
            <div className="text-xl font-bold text-yellow-400">{stats.activeBosses}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-sm text-gray-400">已重生</div>
            <div className="text-xl font-bold text-green-400">{stats.spawnedBosses}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-sm text-gray-400">當前時間</div>
            <div className="text-sm font-medium text-gray-300">
              {new Date(currentTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* 新增頭目表單 */}
      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">新增頭目</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">章節名稱</label>
              <input
                type="text"
                value={formData.episodeName}
                onChange={(e) => setFormData({...formData, episodeName: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：Episode 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">地圖名稱</label>
              <input
                type="text"
                value={formData.mapName}
                onChange={(e) => setFormData({...formData, mapName: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：Map 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">頭目名稱</label>
              <input
                type="text"
                value={formData.bossName}
                onChange={(e) => setFormData({...formData, bossName: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="頭目名稱"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">重生間隔(分鐘)</label>
              <input
                type="number"
                value={formData.respawnInterval}
                onChange={(e) => setFormData({...formData, respawnInterval: parseInt(e.target.value) || 180})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addBoss}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
            >
              新增頭目
            </button>
            <button
              onClick={cancelForm}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-medium transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 新增頭目按鈕 */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增頭目
        </button>
      )}

      {/* 章節列表 */}
      <div className="space-y-4">
        {episodes.map(episode => {
          const isExpanded = expandedEpisodes[episode.id];
          const episodeStats = {
            total: episode.maps.reduce((acc, map) => acc + map.bosses.length, 0),
            active: episode.maps.reduce((acc, map) => 
              acc + map.bosses.filter(boss => boss.isActive).length, 0
            ),
            spawned: episode.maps.reduce((acc, map) => 
              acc + map.bosses.filter(boss => 
                boss.isActive && boss.nextSpawnTime - currentTime <= 0
              ).length, 0
            )
          };

          return (
            <div key={episode.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              {/* 章節標題 */}
              <div
                onClick={() => toggleEpisode(episode.id)}
                className="p-4 bg-gray-750 cursor-pointer hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  <Book className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold">{episode.name}</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">地圖數: {episode.maps.length}</span>
                    <span className="text-blue-400">頭目: {episodeStats.total}</span>
                    {episodeStats.spawned > 0 && (
                      <span className="text-green-400 font-medium">✨ {episodeStats.spawned} 已重生</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 章節內容 */}
              {isExpanded && (
                <div className="p-4 space-y-4">
                  {episode.maps.map(map => (
                    <div key={map.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      {/* 地圖標題 */}
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          {map.name}
                        </h3>
                        <span className="text-sm text-gray-400">
                          {map.bosses.length} 個頭目
                        </span>
                      </div>

                      {/* 頭目列表 */}
                      <div className="space-y-3">
                        {map.bosses.map(boss => {
                          const timeRemaining = boss.isActive ? (boss.nextSpawnTime - currentTime) : null;
                          const isSpawned = timeRemaining !== null && timeRemaining <= 0;
                          const isAlmostSpawned = timeRemaining !== null && timeRemaining > 0 && timeRemaining <= 10 * 60 * 1000;

                          return (
                            <div
                              key={boss.id}
                              className={`bg-gray-600 rounded-lg p-4 border ${
                                isSpawned ? 'border-green-500 bg-green-900/30' : 
                                isAlmostSpawned ? 'border-yellow-500 bg-yellow-900/30' : 
                                'border-gray-500'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-bold text-lg flex items-center gap-2">
                                    {boss.name}
                                    {isSpawned && <AlertCircle className="w-5 h-5 text-green-400" />}
                                    {isAlmostSpawned && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                                  </h4>
                                  <div className="text-sm text-gray-400">
                                    重生間隔: {Math.floor(boss.respawnInterval / 60)}小時{boss.respawnInterval % 60}分
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteBoss(episode.id, map.id, boss.id)}
                                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                  title="刪除頭目"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* 時間資訊 */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div className="bg-gray-800 rounded p-2">
                                  <div className="text-xs text-gray-400">上次擊敗</div>
                                  <div className="font-medium">{formatDateTime(boss.lastKilledTime)}</div>
                                </div>
                                <div className="bg-gray-800 rounded p-2">
                                  <div className="text-xs text-gray-400">預計重生</div>
                                  <div className="font-medium">{formatDateTime(boss.nextSpawnTime)}</div>
                                </div>
                              </div>

                              {/* 倒數計時 */}
                              <div className="mb-3">
                                {boss.isActive ? (
                                  <div className={`text-center py-3 rounded-md ${
                                    isSpawned ? 'bg-green-600' : isAlmostSpawned ? 'bg-yellow-600' : 'bg-blue-600'
                                  }`}>
                                    <div className="text-lg font-bold">
                                      {isSpawned ? '✨ 已重生！' : formatTimeRemaining(timeRemaining)}
                                    </div>
                                    <div className="text-xs">
                                      {isSpawned ? '可以前往挑戰' : '剩餘重生時間'}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-3 rounded-md bg-gray-800 border border-gray-600">
                                    <div className="text-gray-400">
                                      <Clock className="w-4 h-4 inline mr-2" />
                                      等待擊敗記錄
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* 操作按鈕 */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => markBossKilled(episode.id, map.id, boss.id)}
                                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                  <Sword className="w-4 h-4" />
                                  記錄擊敗
                                </button>
                                {boss.isActive && (
                                  <button
                                    onClick={() => resetBoss(episode.id, map.id, boss.id)}
                                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-medium transition-colors text-sm"
                                  >
                                    重置
                                  </button>
                                )}
                              </div>

                              {/* 警告提示 */}
                              {isAlmostSpawned && !isSpawned && (
                                <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-600 rounded-md">
                                  <div className="flex items-center gap-2 text-yellow-400 text-xs">
                                    <AlertCircle className="w-3 h-3" />
                                    即將在10分鐘內重生！
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* 空地圖提示 */}
                        {map.bosses.length === 0 && (
                          <div className="text-center py-4 text-gray-500 bg-gray-600 rounded-lg border border-dashed border-gray-500">
                            <p className="text-sm">此地圖還沒有頭目</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* 空章節提示 */}
                  {episode.maps.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>此章節還沒有地圖</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 空狀態 */}
      {episodes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">還沒有任何章節記錄</p>
          <p>點擊上方的「新增頭目」按鈕開始建立你的頭目追蹤系統</p>
        </div>
      )}
    </div>
  );
};

export default BossTracker;