/*
圆柱体结构:
底面圆心O在原点(0,0,0)，顶面圆心O'在(0,0,h)，侧面方程为x² + y² = r²（半径r，沿z轴延伸）。

粒子运动分解:
粒子的运动可分解为z 方向和xy 平面内的两个独立分量：
z 方向：粒子从z=0运动到z=h，总时间为t，做匀速直线运动（不受侧面反弹影响，因侧面平行于z轴）。
xy 平面内：粒子在半径r的圆内运动，碰撞侧面时发生完全弹性反弹（入射角 = 反射角，速率不变），等效于沿弦运动，经n次反弹后从顶面圆周离开。

z 方向速度分量vz
总位移：h。
总时间：t。
速度：vz = h / t。

xy 平面内速度分量v_xy
粒子合速度大小为v，由勾股定理：
v² = vz² + v_xy²
故 v_xy = √(v² - vz²)。

xy 平面内总路程s_all
运动时间为t，故总路程：s_all = v_xy · t。

单次弦长s_single
n次反弹意味着粒子在 xy 平面内经历n+1段直线运动（弦）。
因对称性，各段弦长相等：s_single = s_all / (n + 1)。

弦长与圆心角的关系
弦长公式：对于半径r的圆，弦长s对应的圆心角为2θ，则：
s = 2r · sinθ
代入s_single得：θ = arcsin(s_single / (2r))。

碰撞点的角度计算
初始角度：初始位置(x0, y0)在底面圆周上（x0² + y0² = r²），极角α0 = arctan2(y0, x0)。
第一次碰撞点角度：每次弦对应的圆心角为2θ，故第一次碰撞点极角：α1 = α0 + 2θ（方向由对称性确定，取其中一解）。

第一次碰撞的时间与 z 坐标
第一次碰撞前运动路程为s_single，时间：t1 = s_single / v_xy。
z 坐标：z1 = vz · t1。

第一次碰撞点P1的坐标为：
x1 = r · cos(α1)
y1 = r · sin(α1)
z1 = vz · t1
*/
#include <stdio.h>
#include <math.h>
 
#define PI 3.14159265358979323846
 
int main() {
    int r, h, n;scanf("%d%d%d", &r, &h, &n);
    double x0, y0, v, t;scanf("%lf%lf%lf%lf", &x0, &y0, &v, &t);
    double vz = h / t;
    double v_xy = sqrt(v * v - vz * vz);
    double s_all = v_xy * t;
    double s_single = s_all / (n + 1);
    double theta = asin(s_single / (2.0 * r));
    double alpha0 = atan2(y0, x0);
    double alpha_collision = alpha0 + 2 * theta;
    double t_first = s_single / v_xy;
     
    double x = r * cos(alpha_collision);
    double y = r * sin(alpha_collision);
    double z = vz * t_first;
     
    printf("%.6f %.6f %.6f\n", x, y, z);
     
    return 0;
}