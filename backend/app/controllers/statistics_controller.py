# -*- coding: utf-8 -*-
"""
统计控制器
"""
from flask import Blueprint
from app.services.statistics_service import statistics_service
from app.utils.response import success_response
from app.controllers.auth_controller import login_required

statistics_bp = Blueprint('statistics', __name__)


@statistics_bp.route('', methods=['GET'])
@login_required
def get_statistics():
    """获取成绩统计数据"""
    stats = statistics_service.calculate_statistics()
    return success_response(stats)


@statistics_bp.route('/distribution', methods=['GET'])
@login_required
def get_distribution():
    """获取成绩分布"""
    distribution = statistics_service.get_score_distribution()
    return success_response(distribution)


@statistics_bp.route('/class', methods=['GET'])
@login_required
def get_class_statistics():
    """获取班级统计"""
    class_stats = statistics_service.get_class_statistics()
    return success_response(class_stats)


@statistics_bp.route('/ranking', methods=['GET'])
@login_required
def get_ranking():
    """获取成绩排名"""
    ranking = statistics_service.get_ranking(limit=10)
    return success_response(ranking)
