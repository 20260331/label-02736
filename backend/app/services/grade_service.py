# -*- coding: utf-8 -*-
"""
成绩服务层
"""
from datetime import datetime
from app.config import Config
from app.mappers.grade_mapper import grade_mapper
from app.mappers.student_mapper import student_mapper
from app.mappers.operation_log_mapper import operation_log_mapper
from app.entity.grade import Grade
from app.entity.operation_log import OperationLog
from app.utils.logger import get_logger

logger = get_logger(__name__)


class GradeService:
    """成绩服务"""
    
    def __init__(self):
        self.grade_mapper = grade_mapper
        self.student_mapper = student_mapper
        self.log_mapper = operation_log_mapper
    
    def list_grades(self, page=1, size=None, keyword=None, min_score=None, max_score=None):
        """获取成绩列表（分页+搜索+分数区间筛选）"""
        size = size or Config.DEFAULT_PAGE_SIZE
        size = min(size, Config.MAX_PAGE_SIZE)
        
        grades = self._filter_grades(keyword, min_score, max_score)
        
        total = len(grades)
        total_pages = (total + size - 1) // size if total > 0 else 1
        page = max(1, min(page, total_pages))
        
        start = (page - 1) * size
        end = start + size
        page_data = grades[start:end]
        
        return {
            'data': [g.to_dict() if hasattr(g, 'to_dict') else g for g in page_data],
            'pagination': {
                'page': page,
                'size': size,
                'total': total,
                'total_pages': total_pages
            }
        }
    
    def _get_student_grades(self):
        """从学生管理中获取三科成绩并转换为成绩记录格式"""
        students = self.student_mapper.find_all()
        student_grades = []
        
        course_map = {
            'chinese_score': '语文',
            'math_score': '数学',
            'english_score': '英语'
        }
        
        for student in students:
            for score_field, course_name in course_map.items():
                score = getattr(student, score_field, 0)
                grade_dict = {
                    'id': f'student_{student.id}_{score_field}',
                    'student_id': student.student_id,
                    'name': student.name,
                    'course_name': course_name,
                    'score': float(score) if score else 0,
                    'exam_time': student.created_at[:10] if student.created_at else datetime.now().strftime('%Y-%m-%d'),
                    'created_at': student.created_at,
                    'updated_at': student.updated_at,
                    'from_student': True
                }
                student_grades.append(Grade.from_dict(grade_dict))
        
        return student_grades
    
    def _filter_grades(self, keyword=None, min_score=None, max_score=None):
        """内部筛选方法 - 合并独立录入的成绩和学生管理中的成绩"""
        custom_grades = self.grade_mapper.find_all()
        student_grades = self._get_student_grades()
        all_grades = custom_grades + student_grades
        
        if keyword:
            keyword_lower = keyword.lower()
            all_grades = [
                g for g in all_grades
                if keyword_lower in (g.student_id or '').lower()
                or keyword_lower in (g.name or '').lower()
                or keyword_lower in (g.course_name or '').lower()
            ]
        
        if min_score is not None or max_score is not None:
            min_s = min_score if min_score is not None else 0
            max_s = max_score if max_score is not None else 100
            all_grades = [g for g in all_grades if min_s <= g.score <= max_s]
        
        return all_grades
    
    def get_statistics(self, keyword=None, min_score=None, max_score=None):
        """获取成绩统计"""
        grades = self._filter_grades(keyword, min_score, max_score)
        
        if not grades:
            return {
                'total_count': 0,
                'average_score': 0,
                'max_score': 0,
                'min_score': 0,
                'by_course': {}
            }
        
        scores = [g.score for g in grades]
        
        by_course = {}
        for g in grades:
            course = g.course_name or '未分类'
            if course not in by_course:
                by_course[course] = {
                    'count': 0,
                    'scores': [],
                    'average': 0,
                    'max': 0,
                    'min': 0
                }
            by_course[course]['count'] += 1
            by_course[course]['scores'].append(g.score)
        
        for course in by_course:
            course_scores = by_course[course]['scores']
            by_course[course]['average'] = round(sum(course_scores) / len(course_scores), 2)
            by_course[course]['max'] = max(course_scores)
            by_course[course]['min'] = min(course_scores)
            del by_course[course]['scores']
        
        return {
            'total_count': len(grades),
            'average_score': round(sum(scores) / len(scores), 2),
            'max_score': max(scores),
            'min_score': min(scores),
            'by_course': by_course
        }
    
    def get_grade_by_id(self, id):
        """根据 ID 获取成绩"""
        grade = self.grade_mapper.find_by_id(id)
        return grade.to_dict() if grade else None
    
    def add_grade(self, data, user_id=None, username=None):
        """添加成绩"""
        is_valid, errors = Grade.validate(data)
        if not is_valid:
            return None, errors
        
        grade = Grade(
            student_id=data['student_id'],
            name=data['name'],
            course_name=data['course_name'],
            score=data['score'],
            exam_time=data['exam_time']
        )
        
        self.grade_mapper.insert(grade)
        logger.info(f'Grade created: {grade.student_id} - {grade.name} - {grade.course_name}')
        
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
        grade = self.grade_mapper.find_by_id(id)
        if grade is None:
            return None, ['成绩记录不存在']
        
        is_valid, errors = Grade.validate(data, is_update=True)
        if not is_valid:
            return None, errors
        
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
        
        self.grade_mapper.update(id, grade.to_dict())
        logger.info(f'Grade updated: {grade.student_id} - {grade.name} - {grade.course_name}')
        
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
        grade = self.grade_mapper.find_by_id(id)
        if grade is None:
            return False, '成绩记录不存在'
        
        self.grade_mapper.delete(id)
        logger.info(f'Grade deleted: {grade.student_id} - {grade.name} - {grade.course_name}')
        
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


grade_service = GradeService()
