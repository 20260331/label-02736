# -*- coding: utf-8 -*-
"""
全局异常处理模块
"""
from flask import jsonify
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AppException(Exception):
    """应用异常基类"""
    def __init__(self, message, code='INTERNAL_ERROR', status_code=500, details=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details


class ValidationError(AppException):
    """验证错误"""
    def __init__(self, message='输入验证失败', details=None):
        super().__init__(message, 'VALIDATION_ERROR', 400, details)


class NotFoundError(AppException):
    """资源不存在错误"""
    def __init__(self, message='资源不存在', details=None):
        super().__init__(message, 'NOT_FOUND', 404, details)


class AuthError(AppException):
    """认证错误"""
    def __init__(self, message='认证失败', details=None):
        super().__init__(message, 'UNAUTHORIZED', 401, details)


class DuplicateError(AppException):
    """重复数据错误"""
    def __init__(self, message='数据已存在', details=None):
        super().__init__(message, 'DUPLICATE_ENTRY', 409, details)


class StorageError(AppException):
    """存储错误"""
    def __init__(self, message='数据存储错误', details=None):
        super().__init__(message, 'STORAGE_ERROR', 500, details)


class BusinessError(AppException):
    """业务逻辑错误"""
    def __init__(self, message='业务处理失败', details=None):
        super().__init__(message, 'BUSINESS_ERROR', 400, details)


def make_error_response(code, message, details=None, status_code=500):
    """创建错误响应"""
    response = {
        'success': False,
        'error': {
            'code': code,
            'message': message,
            'details': details
        }
    }
    return jsonify(response), status_code


def register_error_handlers(app):
    """注册全局错误处理器"""
    
    @app.errorhandler(AppException)
    def handle_app_exception(error):
        """处理应用异常"""
        logger.error(f'AppException: {error.code} - {error.message}')
        return make_error_response(
            error.code,
            error.message,
            error.details,
            error.status_code
        )
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """处理验证错误"""
        logger.warning(f'ValidationError: {error.message}')
        return make_error_response(
            error.code,
            error.message,
            error.details,
            error.status_code
        )
    
    @app.errorhandler(NotFoundError)
    def handle_not_found_error(error):
        """处理资源不存在错误"""
        logger.warning(f'NotFoundError: {error.message}')
        return make_error_response(
            error.code,
            error.message,
            error.details,
            error.status_code
        )
    
    @app.errorhandler(AuthError)
    def handle_auth_error(error):
        """处理认证错误"""
        logger.warning(f'AuthError: {error.message}')
        return make_error_response(
            error.code,
            error.message,
            error.details,
            error.status_code
        )
    
    @app.errorhandler(BusinessError)
    def handle_business_error(error):
        """处理业务逻辑错误"""
        logger.warning(f'BusinessError: {error.message}')
        return make_error_response(
            error.code,
            error.message,
            error.details,
            error.status_code
        )
    
    @app.errorhandler(400)
    def handle_bad_request(error):
        """处理 400 错误"""
        return make_error_response(
            'BAD_REQUEST',
            '请求参数错误',
            str(error),
            400
        )
    
    @app.errorhandler(401)
    def handle_unauthorized(error):
        """处理 401 错误"""
        return make_error_response(
            'UNAUTHORIZED',
            '未授权访问',
            None,
            401
        )
    
    @app.errorhandler(404)
    def handle_not_found(error):
        """处理 404 错误"""
        return make_error_response(
            'NOT_FOUND',
            '请求的资源不存在',
            None,
            404
        )
    
    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        """处理 405 错误"""
        return make_error_response(
            'METHOD_NOT_ALLOWED',
            '请求方法不允许',
            None,
            405
        )
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        """处理 500 错误"""
        logger.error(f'Internal Server Error: {error}')
        return make_error_response(
            'INTERNAL_ERROR',
            '服务器内部错误',
            None,
            500
        )
    
    @app.errorhandler(Exception)
    def handle_unknown_error(error):
        """处理未知错误"""
        logger.error(f'Unknown Error: {type(error).__name__} - {error}')
        return make_error_response(
            'INTERNAL_ERROR',
            '服务器内部错误',
            None,
            500
        )
