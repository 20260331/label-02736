# -*- coding: utf-8 -*-
"""
学生服务层
"""
from datetime import datetime
from app.config import Config
from app.mappers.student_mapper import student_mapper
from app.mappers.operation_log_mapper import operation_log_mapper
from app.entity.student import Student
from app.entity.operation_log import OperationLog
from app.utils.logger import get_logger

logger = get_logger(__name__)


class StudentService:
    """学生服务"""
    
    def __init__(self):
        self.student_mapper = student_mapper
        self.log_mapper = operation_log_mapper
    
    def list_students(self, page=1, size=None, keyword=None):
        """获取学生列表（分页+搜索）"""
        size = size or Config.DEFAULT_PAGE_SIZE
        size = min(size, Config.MAX_PAGE_SIZE)
        
        # 获取数据
        if keyword:
            students = self.student_mapper.find_by_keyword(keyword)
        else:
            students = self.student_mapper.find_all()
        
        # 计算分页
        total = len(students)
        total_pages = (total + size - 1) // size if total > 0 else 1
        page = max(1, min(page, total_pages))
        
        # 分页切片
        start = (page - 1) * size
        end = start + size
        page_data = students[start:end]
        
        return {
            'data': [s.to_dict() for s in page_data],
            'pagination': {
                'page': page,
                'size': size,
                'total': total,
                'total_pages': total_pages
            }
        }
    
    def get_student_by_id(self, id):
        """根据 ID 获取学生"""
        student = self.student_mapper.find_by_id(id)
        return student.to_dict() if student else None
    
    def add_student(self, data, user_id=None, username=None):
        """添加学生"""
        # 验证数据
        is_valid, errors = Student.validate(data)
        if not is_valid:
            return None, errors
        
        # 检查学号是否已存在
        if self.student_mapper.exists_by_student_id(data['student_id']):
            return None, ['学号已存在']
        
        # 创建学生实体
        student = Student(
            student_id=data['student_id'],
            name=data['name'],
            gender=data.get('gender', 'male'),
            class_name=data.get('class_name', ''),
            chinese_score=data.get('chinese_score', 0),
            math_score=data.get('math_score', 0),
            english_score=data.get('english_score', 0)
        )
        
        # 保存到数据库
        self.student_mapper.insert(student)
        logger.info(f'Student created: {student.student_id} - {student.name}')
        
        # 记录操作日志
        if user_id:
            log = OperationLog(
                user_id=user_id,
                username=username,
                action=OperationLog.ACTION_CREATE,
                target_type=OperationLog.TARGET_STUDENT,
                target_id=student.id,
                details={'student_id': student.student_id, 'name': student.name}
            )
            self.log_mapper.insert(log)
        
        return student.to_dict(), None
    
    def update_student(self, id, data, user_id=None, username=None):
        """更新学生"""
        # 检查学生是否存在
        student = self.student_mapper.find_by_id(id)
        if student is None:
            return None, ['学生不存在']
        
        # 验证数据
        is_valid, errors = Student.validate(data, is_update=True)
        if not is_valid:
            return None, errors
        
        # 如果更新学号，检查是否重复
        if 'student_id' in data and data['student_id'] != student.student_id:
            if self.student_mapper.exists_by_student_id(data['student_id'], exclude_id=id):
                return None, ['学号已存在']
            student.student_id = data['student_id']
        
        # 更新字段
        if 'name' in data:
            student.name = data['name']
        if 'gender' in data:
            student.gender = data['gender']
        if 'class_name' in data:
            student.class_name = data['class_name']
        
        # 更新成绩
        student.update_scores(
            chinese_score=data.get('chinese_score'),
            math_score=data.get('math_score'),
            english_score=data.get('english_score')
        )
        
        # 保存更新
        self.student_mapper.update(id, student.to_dict())
        logger.info(f'Student updated: {student.student_id} - {student.name}')
        
        # 记录操作日志
        if user_id:
            log = OperationLog(
                user_id=user_id,
                username=username,
                action=OperationLog.ACTION_UPDATE,
                target_type=OperationLog.TARGET_STUDENT,
                target_id=student.id,
                details={'student_id': student.student_id, 'name': student.name, 'changes': data}
            )
            self.log_mapper.insert(log)
        
        return student.to_dict(), None
    
    def remove_student(self, id, user_id=None, username=None):
        """删除学生"""
        # 检查学生是否存在
        student = self.student_mapper.find_by_id(id)
        if student is None:
            return False, '学生不存在'
        
        # 删除学生
        self.student_mapper.delete(id)
        logger.info(f'Student deleted: {student.student_id} - {student.name}')
        
        # 记录操作日志
        if user_id:
            log = OperationLog(
                user_id=user_id,
                username=username,
                action=OperationLog.ACTION_DELETE,
                target_type=OperationLog.TARGET_STUDENT,
                target_id=id,
                details={'student_id': student.student_id, 'name': student.name}
            )
            self.log_mapper.insert(log)
        
        return True, None


# 单例实例
student_service = StudentService()
