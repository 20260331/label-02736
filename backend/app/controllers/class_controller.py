# -*- coding: utf-8 -*-
"""
班级管理控制器
"""
from flask import Blueprint, request
from app.services.class_service import class_service
from app.utils.response import success_response, error_response
from app.controllers.auth_controller import login_required, sanitize_input
from app.exceptions.handlers import ValidationError, NotFoundError, BusinessError

class_bp = Blueprint('classes', __name__)


def sanitize_class_data(data):
    """清理班级数据输入"""
    if not isinstance(data, dict):
        return {}
    
    sanitized = {}
    string_fields = ['name', 'description']
    for field in string_fields:
        if field in data:
            sanitized[field] = sanitize_input(data[field])
    
    return sanitized


@class_bp.route('', methods=['GET'])
@login_required
def get_classes():
    """获取所有班级列表"""
    classes = class_service.get_all_classes()
    return success_response(data=classes)


@class_bp.route('/<id>', methods=['GET'])
@login_required
def get_class(id):
    """获取单个班级"""
    class_info = class_service.get_class_by_id(id)
    return success_response(data=class_info)


@class_bp.route('', methods=['POST'])
@login_required
def create_class():
    """创建班级"""
    data = request.get_json()
    if not data:
        return error_response('请求数据不能为空', 400)
    
    sanitized_data = sanitize_class_data(data)
    result = class_service.create_class(sanitized_data)
    return success_response(data=result, message='班级创建成功')


@class_bp.route('/<id>', methods=['PUT'])
@login_required
def update_class(id):
    """更新班级"""
    data = request.get_json()
    if not data:
        return error_response('请求数据不能为空', 400)
    
    sanitized_data = sanitize_class_data(data)
    result = class_service.update_class(id, sanitized_data)
    return success_response(data=result, message='班级更新成功')


@class_bp.route('/<id>', methods=['DELETE'])
@login_required
def delete_class(id):
    """删除班级"""
    class_service.delete_class(id)
    return success_response(message='班级删除成功')
