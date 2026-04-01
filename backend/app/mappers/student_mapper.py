# -*- coding: utf-8 -*-
"""
学生数据映射层
"""
from app.config import Config
from app.mappers.excel_storage import ExcelStorage
from app.entity.student import Student


class StudentMapper:
    """学生数据映射器"""
    
    COLUMNS = [
        'id', 'student_id', 'name', 'gender', 'class_name',
        'chinese_score', 'math_score', 'english_score',
        'total_score', 'average_score', 'created_at', 'updated_at'
    ]
    
    SEARCH_COLUMNS = ['student_id', 'name', 'class_name']
    
    def __init__(self):
        self.storage = ExcelStorage(Config.STUDENTS_FILE, self.COLUMNS)
    
    def find_all(self):
        """获取所有学生"""
        data = self.storage.read_all()
        return [Student.from_dict(item) for item in data]
    
    def find_by_id(self, id):
        """根据 UUID 查找学生"""
        data = self.storage.find_by_id(id)
        return Student.from_dict(data) if data else None
    
    def find_by_student_id(self, student_id):
        """根据学号查找学生"""
        results = self.storage.find_by_field('student_id', student_id)
        return Student.from_dict(results[0]) if results else None
    
    def find_by_keyword(self, keyword):
        """根据关键字搜索学生"""
        data = self.storage.search(keyword, self.SEARCH_COLUMNS)
        return [Student.from_dict(item) for item in data]
    
    def insert(self, student):
        """插入学生记录"""
        if isinstance(student, Student):
            data = student.to_dict()
        else:
            data = student
        self.storage.insert(data)
        return data
    
    def update(self, id, data):
        """更新学生记录"""
        if isinstance(data, Student):
            data = data.to_dict()
        return self.storage.update(id, data)
    
    def delete(self, id):
        """删除学生记录"""
        return self.storage.delete(id)
    
    def exists_by_student_id(self, student_id, exclude_id=None):
        """检查学号是否已存在"""
        student = self.find_by_student_id(student_id)
        if student is None:
            return False
        if exclude_id and student.id == exclude_id:
            return False
        return True
    
    def count(self):
        """获取学生总数"""
        return self.storage.count()


# 单例实例
student_mapper = StudentMapper()
