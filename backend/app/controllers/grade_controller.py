# -*- coding: utf-8 -*-
"""
成绩管理控制器
"""
import re
from flask import Blueprint, request, g
from app.services.grade_service import grade_service
from app.utils.response import success_response, error_response, paginated_response
from app.controllers.auth_controller import login_required, sanitize_input
from app.exceptions.handlers import ValidationError, NotFoundError

grade_bp = Blueprint('grades', __name__)

ID_PATTERN = re.compile(r'^[a-zA-Z0-9\-]{1,50}$')


def validate_id(id_value):
    """验证 ID 格式"""
    if not id_value or not ID_PATTERN.match(id_value):
        return False
    return True


def sanitize_grade_data(data):
    """清理成绩数据输入"""
    if not isinstance(data, dict):
        return {}
    
    sanitized = {}
    
    string_fields = ['student_id', 'name', 'course_name', 'exam_time']
    for field in string_fields:
        if field in data:
            sanitized[field] = sanitize_input(data[field])
    
    if 'score' in data:
        try:
            value = float(data['score'])
            sanitized['score'] = max(0, min(100, value))
        except (ValueError, TypeError):
            sanitized['score'] = 0
    
    return sanitized


@grade_bp.route('', methods=['GET'])
@login_required
def get_grades():
    """获取成绩列表"""
    page = request.args.get('page', 1, type=int)
    size = request.args.get('size', 10, type=int)
    keyword = sanitize_input(request.args.get('keyword', ''))
    min_score = request.args.get('min_score', None, type=float)
    max_score = request.args.get('max_score', None, type=float)
    
    page = max(1, min(page, 1000))
    size = max(1, min(size, 100))
    
    result = grade_service.list_grades(
        page, size,
        keyword=keyword or None,
        min_score=min_score,
        max_score=max_score
    )
    
    return paginated_response(result['data'], result['pagination'])


@grade_bp.route('/statistics', methods=['GET'])
@login_required
def get_grade_statistics():
    """获取成绩统计"""
    keyword = sanitize_input(request.args.get('keyword', ''))
    min_score = request.args.get('min_score', None, type=float)
    max_score = request.args.get('max_score', None, type=float)
    
    stats = grade_service.get_statistics(
        keyword=keyword or None,
        min_score=min_score,
        max_score=max_score
    )
    
    return success_response(stats)


@grade_bp.route('/<string:id>', methods=['GET'])
@login_required
def get_grade(id):
    """获取单个成绩"""
    if not validate_id(id):
        raise ValidationError('无效的成绩 ID')
    
    grade = grade_service.get_grade_by_id(id)
    
    if grade is None:
        raise NotFoundError('成绩记录不存在')
    
    return success_response(grade)


@grade_bp.route('', methods=['POST'])
@login_required
def create_grade():
    """创建成绩"""
    data = request.get_json()
    
    if not data:
        raise ValidationError('请求数据不能为空')
    
    sanitized_data = sanitize_grade_data(data)
    
    result, errors = grade_service.add_grade(
        sanitized_data,
        user_id=g.user_id,
        username=g.username
    )
    
    if errors:
        raise ValidationError('数据验证失败', errors)
    
    return success_response(result, '添加成功')


@grade_bp.route('/<string:id>', methods=['PUT'])
@login_required
def update_grade(id):
    """更新成绩"""
    if not validate_id(id):
        raise ValidationError('无效的成绩 ID')
    
    data = request.get_json()
    
    if not data:
        raise ValidationError('请求数据不能为空')
    
    sanitized_data = sanitize_grade_data(data)
    
    result, errors = grade_service.update_grade(
        id,
        sanitized_data,
        user_id=g.user_id,
        username=g.username
    )
    
    if errors:
        if '成绩记录不存在' in errors:
            raise NotFoundError('成绩记录不存在')
        raise ValidationError('数据验证失败', errors)
    
    return success_response(result, '更新成功')


@grade_bp.route('/<string:id>', methods=['DELETE'])
@login_required
def delete_grade(id):
    """删除成绩"""
    if not validate_id(id):
        raise ValidationError('无效的成绩 ID')
    
    success, error = grade_service.remove_grade(
        id,
        user_id=g.user_id,
        username=g.username
    )
    
    if not success:
        raise NotFoundError(error)
    
    return success_response(message='删除成功')
