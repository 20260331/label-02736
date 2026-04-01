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
    
    def find_by_keyword(self, keyword):
        """根据关键字搜索成绩"""
        data = self.storage.search(keyword, self.SEARCH_COLUMNS)
        return [Grade.from_dict(item) for item in data]
    
    def find_by_filters(self, keyword=None, min_score=None, max_score=None):
        """根据条件筛选成绩"""
        grades = self.find_all()
        
        if keyword:
            keyword_lower = str(keyword).lower()
            grades = [
                g for g in grades 
                if any(keyword_lower in str(getattr(g, col, '')).lower() 
                       for col in self.SEARCH_COLUMNS)
            ]
        
        if min_score is not None:
            grades = [g for g in grades if g.score >= min_score]
        
        if max_score is not None:
            grades = [g for g in grades if g.score <= max_score]
        
        return grades
    
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


# 单例实例
grade_mapper = GradeMapper()
