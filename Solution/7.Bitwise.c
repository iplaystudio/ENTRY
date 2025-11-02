#include <stdio.h>
const int MOD = 1e9 + 7;

long long qpow(long long a, long long b) {
    long long res = 1;
    while (b) {
        if (b & 1) res = res * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}

int main() {
    int n;
    scanf("%d",&n);
    int v[n + 1];
    long long ret = 0;
    for (int i = 1; i <= n; i++) {
    	scanf("%d",&v[i]);
    	ret ^= v[i];
	}
    ret = (ret + v[1] * qpow(2, n - 1) % MOD) % MOD;

    for (int i = 1; i < n; i++) {
        long long sl = v[1] * qpow(2, i - 1) % MOD;
        long long sr = v[i + 1] * qpow(2, n - i - 1) % MOD;
        ret = (ret + (sl ^ sr)) % MOD;
    }

    printf("%lld\n", ret % MOD);
    return 0;
}