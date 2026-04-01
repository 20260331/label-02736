# -*- coding: utf-8 -*-
"""
学生实体类
"""
import re
import uuid
from datetime import datetime


class Student:
    """学生实体"""
    
    def __init__(self, id=None, student_id=None, name=None, gender=None, class_name=None,
                 chinese_score=0, math_score=0, english_score=0,
                 total_score=None, average_score=None,
                 created_at=None, updated_at=None):
        self.id = id or str(uuid.uuid4())
        self.student_id = student_id
        self.name = name
        self.gender = gender
        self.class_name = class_name
        self.chinese_score = float(chinese_score) if chinese_score is not None else 0
        self.math_score = float(math_score) if math_score is not None else 0
        self.english_score = float(english_score) if english_score is not None else 0
        
        # 计算总分和平均分
        self.total_score = total_score if total_score is not None else self._calculate_total()
        self.average_score = average_score if average_score is not None else self._calculate_average()
        
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
    
    def _calculate_total(self):
        """计算总分"""
        return round(self.chinese_score + self.math_score + self.english_score, 2)
    
    def _calculate_average(self):
        """计算平均分"""
        return round(self.total_score / 3, 2)
    
    def update_scores(self, chinese_score=None, math_score=None, english_score=None):
        """更新成绩"""
        if chinese_score is not None:
            self.chinese_score = float(chinese_score)
        if math_score is not None:
            self.math_score = float(math_score)
        if english_score is not None:
            self.english_score = float(english_score)
        
        self.total_score = self._calculate_total()
        self.average_score = self._calculate_average()
        self.updated_at = datetime.now().isoformat()
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'name': self.name,
            'gender': self.gender,
            'class_name': self.class_name,
            'chinese_score': self.chinese_score,
            'math_score': self.math_score,
            'english_score': self.english_score,
            'total_score': self.total_score,
            'average_score': self.average_score,
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
            gender=data.get('gender'),
            class_name=data.get('class_name'),
            chinese_score=data.get('chinese_score', 0),
            math_score=data.get('math_score', 0),
            english_score=data.get('english_score', 0),
            total_score=data.get('total_score'),
            average_score=data.get('average_score'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    @staticmethod
    def validate(data, is_update=False):
        """验证学生数据"""
        errors = []
        
        # 学号验证（新增时必填）
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
        
        # 性别验证
        if data.get('gender') and data['gender'] not in ['male', 'female']:
            errors.append('性别必须是 male 或 female')
        
        # 成绩验证（必填）
        score_fields = ['chinese_score', 'math_score', 'english_score']
        field_names = {'chinese_score': '语文成绩', 'math_score': '数学成绩', 'english_score': '英语成绩'}
        for field in score_fields:
            score = data.get(field)
            if score is None or score == '':
                errors.append(f'{field_names[field]}不能为空')
            else:
                try:
                    score_val = float(score)
                    if score_val < 0 or score_val > 100:
                        errors.append(f'{field_names[field]}必须在 0-100 之间')
                except (ValueError, TypeError):
                    errors.append(f'{field_names[field]}必须是数字')
        
        return len(errors) == 0, errors
