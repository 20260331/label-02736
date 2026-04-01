/**
 * 统计 API
 */
import { http } from './request.js';

export const StatisticsApi = {
    /**
     * 获取统计数据
     */
    getStatistics() {
        return http.get('/statistics');
    },

    /**
     * 获取成绩分布
     */
    getDistribution() {
        return http.get('/statistics/distribution');
    },

    /**
     * 获取班级统计
     */
    getClassStatistics() {
        return http.get('/statistics/class');
    },

    /**
     * 获取成绩排名
     */
    getRanking() {
        return http.get('/statistics/ranking');
    }
};
