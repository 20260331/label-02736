# -*- coding: utf-8 -*-
"""
响应工具模块
"""
from flask import jsonify


def success_response(data=None, message='操作成功'):
    """成功响应"""
    response = {
        'success': True,
        'message': message
    }
    if data is not None:
        response['data'] = data
    return jsonify(response)


def error_response(message='操作失败', code='ERROR', details=None, status_code=400):
    """错误响应"""
    response = {
        'success': False,
        'error': {
            'code': code,
            'message': message,
            'details': details
        }
    }
    return jsonify(response), status_code


def paginated_response(data, pagination):
    """分页响应"""
    return jsonify({
        'success': True,
        'data': data,
        'pagination': pagination
    })
