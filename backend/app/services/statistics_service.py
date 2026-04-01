# -*- coding: utf-8 -*-
"""
统计服务层
"""
from app.mappers.student_mapper import student_mapper
from app.utils.logger import get_logger

logger = get_logger(__name__)


class StatisticsService:
    """统计服务"""
    
    def __init__(self):
        self.student_mapper = student_mapper
    
    def calculate_statistics(self):
        """计算成绩统计数据"""
        students = self.student_mapper.find_all()
        
        if not students:
            return {
                'count': 0,
                'average': 0,
                'max': 0,
                'min': 0,
                'chinese_avg': 0,
                'math_avg': 0,
                'english_avg': 0,
                'has_data': False
            }
        
        # 计算总分统计
        total_scores = [s.total_score for s in students]
        chinese_scores = [s.chinese_score for s in students]
        math_scores = [s.math_score for s in students]
        english_scores = [s.english_score for s in students]
        
        count = len(students)
        
        return {
            'count': count,
            'average': round(sum(total_scores) / count, 2),
            'max': max(total_scores),
            'min': min(total_scores),
            'chinese_avg': round(sum(chinese_scores) / count, 2),
            'math_avg': round(sum(math_scores) / count, 2),
            'english_avg': round(sum(english_scores) / count, 2),
            'has_data': True
        }
    
    def get_score_distribution(self):
        """获取成绩分布"""
        students = self.student_mapper.find_all()
        
        # 按总分分段统计
        distribution = {
            '优秀(270-300)': 0,
            '良好(240-269)': 0,
            '中等(180-239)': 0,
            '及格(180以下)': 0
        }
        
        for student in students:
            total = student.total_score
            if total >= 270:
                distribution['优秀(270-300)'] += 1
            elif total >= 240:
                distribution['良好(240-269)'] += 1
            elif total >= 180:
                distribution['中等(180-239)'] += 1
            else:
                distribution['及格(180以下)'] += 1
        
        return distribution
    
    def get_class_statistics(self):
        """按班级统计"""
        students = self.student_mapper.find_all()
        
        class_stats = {}
        for student in students:
            class_name = student.class_name or '未分班'
            if class_name not in class_stats:
                class_stats[class_name] = {
                    'count': 0,
                    'total_sum': 0,
                    'chinese_sum': 0,
                    'math_sum': 0,
                    'english_sum': 0
                }
            
            stats = class_stats[class_name]
            stats['count'] += 1
            stats['total_sum'] += student.total_score
            stats['chinese_sum'] += student.chinese_score
            stats['math_sum'] += student.math_score
            stats['english_sum'] += student.english_score
        
        # 计算平均值
        result = []
        for class_name, stats in class_stats.items():
            count = stats['count']
            result.append({
                'class_name': class_name,
                'count': count,
                'average': round(stats['total_sum'] / count, 2),
                'chinese_avg': round(stats['chinese_sum'] / count, 2),
                'math_avg': round(stats['math_sum'] / count, 2),
                'english_avg': round(stats['english_sum'] / count, 2)
            })
        
        return sorted(result, key=lambda x: x['average'], reverse=True)
    
    def get_ranking(self, limit=10):
        """获取成绩排名"""
        students = self.student_mapper.find_all()
        
        # 按总分排序，总分相同时按学号排序保证稳定性
        sorted_students = sorted(
            students, 
            key=lambda x: (-x.total_score, x.student_id)
        )
        
        # 取前 N 名
        top_students = sorted_students[:limit]
        
        return [{
            'rank': idx + 1,
            'student_id': s.student_id,
            'name': s.name,
            'class_name': s.class_name,
            'total_score': s.total_score,
            'average_score': s.average_score
        } for idx, s in enumerate(top_students)]


# 单例实例
statistics_service = StatisticsService()
