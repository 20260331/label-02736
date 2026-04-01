# -*- coding: utf-8 -*-
"""
成绩实体类
"""
import re
import uuid
from datetime import datetime


class Grade:
    """成绩实体"""
    
    def __init__(self, id=None, student_id=None, name=None, course_name=None,
                 score=None, exam_time=None, created_at=None, updated_at=None):
        self.id = id or str(uuid.uuid4())
        self.student_id = student_id
        self.name = name
        self.course_name = course_name
        self.score = float(score) if score is not None else 0
        self.exam_time = exam_time
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
    
    def update(self, student_id=None, name=None, course_name=None, score=None, exam_time=None):
        """更新成绩信息"""
        if student_id is not None:
            self.student_id = student_id
        if name is not None:
            self.name = name
        if course_name is not None:
            self.course_name = course_name
        if score is not None:
            self.score = float(score)
        if exam_time is not None:
            self.exam_time = exam_time
        self.updated_at = datetime.now().isoformat()
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'name': self.name,
            'course_name': self.course_name,
            'score': self.score,
            'exam_time': self.exam_time,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data):
        """从字典创建实例"""
        return cls(
            id=data.get('id'),
            student_id=data.get('student_id'),
            name=data.get('name'),
            course_name=data.get('course_name'),
            score=data.get('score'),
            exam_time=data.get('exam_time'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    @staticmethod
    def validate(data, is_update=False):
        """验证成绩数据"""
        errors = []
        
        # 学号验证
        if not is_update:
            if not data.get('student_id'):
                errors.append('学号不能为空')
            elif not re.match(r'^[A-Za-z0-9]+$', str(data['student_id'])):
                errors.append('学号只能包含字母和数字')
            elif len(str(data['student_id'])) > 20:
                errors.append('学号不能超过20个字符')
        
        # 姓名验证
        if not data.get('name'):
            errors.append('姓名不能为空')
        elif not re.match(r'^[\u4e00-\u9fa5A-Za-z\s]+$', data['name']):
            errors.append('姓名只能包含中文、字母和空格')
        elif len(data['name']) > 50:
            errors.append('姓名不能超过50个字符')
        
        # 课程名称验证
        if not data.get('course_name'):
            errors.append('课程名称不能为空')
        elif len(data['course_name']) > 100:
            errors.append('课程名称不能超过100个字符')
        
        # 成绩分数验证
        score = data.get('score')
        if score is None or score == '':
            errors.append('成绩分数不能为空')
        else:
            try:
                score_val = float(score)
                if score_val < 0 or score_val > 100:
                    errors.append('成绩分数必须在 0-100 之间')
            except (ValueError, TypeError):
                errors.append('成绩分数必须是数字')
        
        # 考试时间验证
        if data.get('exam_time'):
            try:
                datetime.fromisoformat(str(data['exam_time']))
            except (ValueError, TypeError):
                errors.append('考试时间格式不正确')
        
        return len(errors) == 0, errors
