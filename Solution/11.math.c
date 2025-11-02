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