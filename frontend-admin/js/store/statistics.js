/**
 * 统计状态管理
 */
import { StatisticsApi } from '../api/statistics.js';

export const StatisticsStore = {
    statistics: {
        count: 0,
        average: 0,
        max: 0,
        min: 0,
        chinese_avg: 0,
        math_avg: 0,
        english_avg: 0,
        has_data: false
    },
    distribution: {},
    classStats: [],
    ranking: [],
    loading: false,
    
    /**
     * 设置统计数据
     */
    setStatistics(stats) {
        this.statistics = stats;
    },
    
    /**
     * 设置分布数据
     */
    setDistribution(distribution) {
        this.distribution = distribution;
    },
    
    /**
     * 设置班级统计
     */
    setClassStats(classStats) {
        this.classStats = classStats;
    },
    
    /**
     * 设置排名数据
     */
    setRanking(ranking) {
        this.ranking = ranking;
    },
    
    /**
     * 加载统计数据
     */
    async loadStatistics() {
        this.loading = true;
        try {
            const response = await StatisticsApi.getStatistics();
            if (response.success) {
                this.setStatistics(response.data);
            }
            return response;
        } finally {
            this.loading = false;
        }
    },
    
    /**
     * 加载分布数据
     */
    async loadDistribution() {
        const response = await StatisticsApi.getDistribution();
        if (response.success) {
            this.setDistribution(response.data);
        }
        return response;
    },
    
    /**
     * 加载班级统计
     */
    async loadClassStats() {
        const response = await StatisticsApi.getClassStatistics();
        if (response.success) {
            this.setClassStats(response.data);
        }
        return response;
    },
    
    /**
     * 加载排名数据
     */
    async loadRanking() {
        const response = await StatisticsApi.getRanking();
        if (response.success) {
            this.setRanking(response.data);
        }
        return response;
    },
    
    /**
     * 加载所有数据
     */
    async loadAll() {
        this.loading = true;
        try {
            await Promise.all([
                this.loadStatistics(),
                this.loadDistribution(),
                this.loadClassStats(),
                this.loadRanking()
            ]);
        } finally {
            this.loading = false;
        }
    },
    
    /**
     * 清空状态
     */
    clear() {
        this.statistics = {
            count: 0,
            average: 0,
            max: 0,
            min: 0,
            chinese_avg: 0,
            math_avg: 0,
            english_avg: 0,
            has_data: false
        };
        this.distribution = {};
        this.classStats = [];
        this.ranking = [];
    }
};
