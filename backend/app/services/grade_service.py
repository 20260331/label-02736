# -*- coding: utf-8 -*-
"""
成绩服务层
"""
from datetime import datetime
from app.config import Config
from app.mappers.grade_mapper import grade_mapper
from app.mappers.operation_log_mapper import operation_log_mapper
from app.entity.grade import Grade
from app.entity.operation_log import OperationLog
from app.utils.logger import get_logger

logger = get_logger(__name__)


class GradeService:
    """成绩服务"""
    
    def __init__(self):
        self.grade_mapper = grade_mapper
        self.log_mapper = operation_log_mapper
    
    def list_grades(self, page=1, size=None, keyword=None, min_score=None, max_score=None):
        """获取成绩列表（分页+筛选）"""
        size = size or Config.DEFAULT_PAGE_SIZE
        size = min(size, Config.MAX_PAGE_SIZE)
        
        # 获取数据
        grades = self.grade_mapper.find_by_filters(keyword, min_score, max_score)
        
        # 计算分页
        total = len(grades)
        total_pages = (total + size - 1) // size if total > 0 else 1
        page = max(1, min(page, total_pages))
        
        # 分页切片
        start = (page - 1) * size
        end = start + size
        page_data = grades[start:end]
        
        return {
            'data': [g.to_dict() for g in page_data],
            'pagination': {
                'page': page,
                'size': size,
                'total': total,
                'total_pages': total_pages
            }
        }
    
    def get_grade_by_id(self, id):
        """根据 ID 获取成绩"""
        grade = self.grade_mapper.find_by_id(id)
        return grade.to_dict() if grade else None
    
    def get_statistics(self):
        """获取成绩统计数据"""
        grades = self.grade_mapper.find_all()
        
        if not grades:
            return {
                'average_score': 0,
                'max_score': 0,
                'min_score': 0,
                'total_count': 0,
                'course_stats': {}
            }
        
        scores = [g.score for g in grades]
        average_score = round(sum(scores) / len(scores), 2)
        max_score = max(scores)
        min_score = min(scores)
        
        # 按课程分组统计
        course_stats = {}
        for grade in grades:
            course = grade.course_name
            if course not in course_stats:
                course_stats[course] = {
                    'count': 0,
                    'total': 0,
                    'average': 0,
                    'max': 0,
                    'min': 100
                }
            course_stats[course]['count'] += 1
            course_stats[course]['total'] += grade.score
            if grade.score > course_stats[course]['max']:
                course_stats[course]['max'] = grade.score
            if grade.score < course_stats[course]['min']:
                course_stats[course]['min'] = grade.score
        
        # 计算课程平均分
        for course in course_stats:
            course_stats[course]['average'] = round(
                course_stats[course]['total'] / course_stats[course]['count'], 2
            )
        
        return {
            'average_score': average_score,
            'max_score': max_score,
            'min_score': min_score,
            'total_count': len(grades),
            'course_stats': course_stats
        }
    
    def add_grade(self, data, user_id=None, username=None):
        """添加成绩"""
        # 验证数据
        is_valid, errors = Grade.validate(data)
        if not is_valid:
            return None, errors
        
        # 创建成绩实体
        grade = Grade(
            student_id=data['student_id'],
            name=data['name'],
            course_name=data['course_name'],
            score=data['score'],
            exam_time=data['exam_time']
        )
        
        # 保存到数据库
        self.grade_mapper.insert(grade)
        logger.info(f'Grade created: {grade.student_id} - {grade.name} - {grade.course_name}')
        
        # 记录操作日志
        if user_id:
            log = OperationLog(
                user_id=user_id,
                username=username,
                action=OperationLog.ACTION_CREATE,
                target_type='grade',
                target_id=grade.id,
                details={'student_id': grade.student_id, 'name': grade.name, 'course_name': grade.course_name}
            )
            self.log_mapper.insert(log)
        
        return grade.to_dict(), None
    
    def update_grade(self, id, data, user_id=None, username=None):
        """更新成绩"""
        # 检查成绩是否存在
        grade = self.grade_mapper.find_by_id(id)
        if grade is None:
            return None, ['成绩不存在']
        
        # 验证数据
        is_valid, errors = Grade.validate(data, is_update=True)
        if not is_valid:
            return None, errors
        
        # 更新字段
        if 'student_id' in data:
            grade.student_id = data['student_id']
        if 'name' in data:
            grade.name = data['name']
        if 'course_name' in data:
            grade.course_name = data['course_name']
        if 'score' in data:
            grade.score = float(data['score'])
        if 'exam_time' in data:
            grade.exam_time = data['exam_time']
        
        grade.updated_at = datetime.now().isoformat()
        
        # 保存更新
        self.grade_mapper.update(id, grade.to_dict())
        logger.info(f'Grade updated: {grade.student_id} - {grade.name} - {grade.course_name}')
        
        # 记录操作日志
        if user_id:
            log = OperationLog(
                user_id=user_id,
                username=username,
                action=OperationLog.ACTION_UPDATE,
                target_type='grade',
                target_id=grade.id,
                details={'student_id': grade.student_id, 'name': grade.name, 'course_name': grade.course_name, 'changes': data}
            )
            self.log_mapper.insert(log)
        
        return grade.to_dict(), None
    
    def remove_grade(self, id, user_id=None, username=None):
        """删除成绩"""
        # 检查成绩是否存在
        grade = self.grade_mapper.find_by_id(id)
        if grade is None:
            return False, '成绩不存在'
        
        # 删除成绩
        self.grade_mapper.delete(id)
        logger.info(f'Grade deleted: {grade.student_id} - {grade.name} - {grade.course_name}')
        
        # 记录操作日志
        if user_id:
            log = OperationLog(
                user_id=user_id,
                username=username,
                action=OperationLog.ACTION_DELETE,
                target_type='grade',
                target_id=id,
                details={'student_id': grade.student_id, 'name': grade.name, 'course_name': grade.course_name}
            )
            self.log_mapper.insert(log)
        
        return True, None


# 单例实例
grade_service = GradeService()
