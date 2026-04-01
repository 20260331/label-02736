# -*- coding: utf-8 -*-
"""
成绩数据映射层
"""
from app.config import Config
from app.mappers.excel_storage import ExcelStorage
from app.entity.grade import Grade


class GradeMapper:
    """成绩数据映射器"""
    
    COLUMNS = [
        'id', 'student_id', 'name', 'course_name',
        'score', 'exam_time', 'created_at', 'updated_at'
    ]
    
    SEARCH_COLUMNS = ['student_id', 'name', 'course_name']
    
    def __init__(self):
        self.storage = ExcelStorage(Config.GRADES_FILE, self.COLUMNS)
    
    def find_all(self):
        """获取所有成绩"""
        data = self.storage.read_all()
        return [Grade.from_dict(item) for item in data]
    
    def find_by_id(self, id):
        """根据 UUID 查找成绩"""
        data = self.storage.find_by_id(id)
        return Grade.from_dict(data) if data else None
    
    def find_by_course(self, course_name):
        """根据课程名称查找成绩"""
        results = self.storage.find_by_field('course_name', course_name)
        return [Grade.from_dict(item) for item in results]
    
    def find_by_keyword(self, keyword):
        """根据关键字搜索成绩"""
        data = self.storage.search(keyword, self.SEARCH_COLUMNS)
        return [Grade.from_dict(item) for item in data]
    
    def find_by_score_range(self, min_score, max_score):
        """根据分数范围筛选成绩"""
        all_data = self.find_all()
        return [g for g in all_data if min_score <= g.score <= max_score]
    
    def insert(self, grade):
        """插入成绩记录"""
        if isinstance(grade, Grade):
            data = grade.to_dict()
        else:
            data = grade
        self.storage.insert(data)
        return data
    
    def update(self, id, data):
        """更新成绩记录"""
        if isinstance(data, Grade):
            data = data.to_dict()
        return self.storage.update(id, data)
    
    def delete(self, id):
        """删除成绩记录"""
        return self.storage.delete(id)
    
    def count(self):
        """获取成绩总数"""
        return self.storage.count()
    
    def get_all_courses(self):
        """获取所有课程名称列表"""
        data = self.storage.read_all()
        courses = set()
        for item in data:
            if item.get('course_name'):
                courses.add(item['course_name'])
        return sorted(list(courses))


# 单例实例
grade_mapper = GradeMapper()
