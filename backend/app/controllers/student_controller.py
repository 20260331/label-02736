# -*- coding: utf-8 -*-
"""
学生管理控制器
"""
import re
from flask import Blueprint, request, g
from app.services.student_service import student_service
from app.utils.response import success_response, error_response, paginated_response
from app.controllers.auth_controller import login_required, sanitize_input
from app.exceptions.handlers import ValidationError, NotFoundError

student_bp = Blueprint('students', __name__)

# ID 格式验证（UUID 格式）
ID_PATTERN = re.compile(r'^[a-zA-Z0-9\-]{1,50}$')


def validate_id(id_value):
    """验证 ID 格式"""
    if not id_value or not ID_PATTERN.match(id_value):
        return False
    return True


def sanitize_student_data(data):
    """清理学生数据输入"""
    if not isinstance(data, dict):
        return {}
    
    sanitized = {}
    
    # 字符串字段清理
    string_fields = ['student_id', 'name', 'gender', 'class_name']
    for field in string_fields:
        if field in data:
            sanitized[field] = sanitize_input(data[field])
    
    # 数值字段验证
    score_fields = ['chinese_score', 'math_score', 'english_score']
    for field in score_fields:
        if field in data:
            try:
                value = float(data[field])
                # 限制范围 0-100
                sanitized[field] = max(0, min(100, value))
            except (ValueError, TypeError):
                sanitized[field] = 0
    
    return sanitized


@student_bp.route('', methods=['GET'])
@login_required
def get_students():
    """获取学生列表"""
    page = request.args.get('page', 1, type=int)
    size = request.args.get('size', 10, type=int)
    keyword = sanitize_input(request.args.get('keyword', ''))
    
    # 限制分页参数范围
    page = max(1, min(page, 1000))
    size = max(1, min(size, 100))
    
    result = student_service.list_students(page, size, keyword or None)
    
    return paginated_response(result['data'], result['pagination'])


@student_bp.route('/<string:id>', methods=['GET'])
@login_required
def get_student(id):
    """获取单个学生"""
    # 验证 ID 格式
    if not validate_id(id):
        raise ValidationError('无效的学生 ID')
    
    student = student_service.get_student_by_id(id)
    
    if student is None:
        raise NotFoundError('学生不存在')
    
    return success_response(student)


@student_bp.route('', methods=['POST'])
@login_required
def create_student():
    """创建学生"""
    data = request.get_json()
    
    if not data:
        raise ValidationError('请求数据不能为空')
    
    # 清理输入数据
    sanitized_data = sanitize_student_data(data)
    
    result, errors = student_service.add_student(
        sanitized_data,
        user_id=g.user_id,
        username=g.username
    )
    
    if errors:
        raise ValidationError('数据验证失败', errors)
    
    return success_response(result, '添加成功')


@student_bp.route('/<string:id>', methods=['PUT'])
@login_required
def update_student(id):
    """更新学生"""
    # 验证 ID 格式
    if not validate_id(id):
        raise ValidationError('无效的学生 ID')
    
    data = request.get_json()
    
    if not data:
        raise ValidationError('请求数据不能为空')
    
    # 清理输入数据
    sanitized_data = sanitize_student_data(data)
    
    result, errors = student_service.update_student(
        id,
        sanitized_data,
        user_id=g.user_id,
        username=g.username
    )
    
    if errors:
        if '学生不存在' in errors:
            raise NotFoundError('学生不存在')
        raise ValidationError('数据验证失败', errors)
    
    return success_response(result, '更新成功')


@student_bp.route('/<string:id>', methods=['DELETE'])
@login_required
def delete_student(id):
    """删除学生"""
    # 验证 ID 格式
    if not validate_id(id):
        raise ValidationError('无效的学生 ID')
    
    success, error = student_service.remove_student(
        id,
        user_id=g.user_id,
        username=g.username
    )
    
    if not success:
        raise NotFoundError(error)
    
    return success_response(message='删除成功')
