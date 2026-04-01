# -*- coding: utf-8 -*-
"""
班级服务层
"""
from datetime import datetime
from app.mappers.class_mapper import class_mapper
from app.mappers.student_mapper import student_mapper
from app.entity.class_info import ClassInfo
from app.exceptions.handlers import ValidationError, NotFoundError, BusinessError


class ClassService:
    """班级服务类"""
    
    def get_all_classes(self):
        """获取所有班级列表"""
        classes = class_mapper.find_all()
        return [c.to_dict() for c in classes]
    
    def get_class_by_id(self, id):
        """根据 ID 获取班级"""
        class_info = class_mapper.find_by_id(id)
        if not class_info:
            raise NotFoundError('班级不存在')
        return class_info.to_dict()
    
    def create_class(self, data):
        """创建班级"""
        # 验证数据
        is_valid, errors = ClassInfo.validate(data)
        if not is_valid:
            raise ValidationError('数据验证失败', errors)
        
        # 检查班级名称是否已存在
        if class_mapper.exists_by_name(data['name']):
            raise ValidationError('班级名称已存在')
        
        # 创建班级
        class_info = ClassInfo(
            name=data['name'],
            description=data.get('description', '')
        )
        
        class_mapper.insert(class_info)
        return class_info.to_dict()
    
    def update_class(self, id, data):
        """更新班级"""
        # 检查班级是否存在
        class_info = class_mapper.find_by_id(id)
        if not class_info:
            raise NotFoundError('班级不存在')
        
        # 验证数据
        is_valid, errors = ClassInfo.validate(data, is_update=True)
        if not is_valid:
            raise ValidationError('数据验证失败', errors)
        
        # 检查班级名称是否已被其他班级使用
        if data.get('name') and class_mapper.exists_by_name(data['name'], exclude_id=id):
            raise ValidationError('班级名称已存在')
        
        # 更新数据
        update_data = {
            'name': data.get('name', class_info.name),
            'description': data.get('description', class_info.description),
            'updated_at': datetime.now().isoformat()
        }
        
        class_mapper.update(id, update_data)
        
        # 返回更新后的数据
        updated = class_mapper.find_by_id(id)
        return updated.to_dict()
    
    def delete_class(self, id):
        """删除班级"""
        # 检查班级是否存在
        class_info = class_mapper.find_by_id(id)
        if not class_info:
            raise NotFoundError('班级不存在')
        
        # 检查班级下是否有学生
        students = student_mapper.find_all()
        students_in_class = [s for s in students if s.class_name == class_info.name]
        
        if students_in_class:
            raise BusinessError(f'该班级下有 {len(students_in_class)} 名学生，无法删除')
        
        # 删除班级
        class_mapper.delete(id)
        return True
    
    def get_student_count_by_class(self, class_name):
        """获取班级学生数量"""
        students = student_mapper.find_all()
        return len([s for s in students if s.class_name == class_name])


# 单例实例
class_service = ClassService()
