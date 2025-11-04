/*
寻找最长回文子串的经典方法有多种，本题解采用中心扩展法，其核心思想是：所有回文子串都有一个 “中心”（奇数长度的回文中心是单个字符，如 “aba” 的中心是 “b”；偶数长度的回文中心是两个字符之间的位置，如 “abba” 的中心在两个 “b” 之间）。通过遍历字符串中所有可能的中心，向两侧扩展检查对称字符，即可找到最长回文子串。
中心扩展法的步骤
遍历所有可能的中心：对于长度为n的字符串，可能的中心有2n-1个：
n个奇数长度中心+n-1个偶数长度中心
从中心向两侧扩展：对每个中心(left, right)，初始时left = right（奇数中心）或left = i, right = i+1（偶数中心），不断比较left和right位置的字符：
若相等，则left--、right++（继续扩展）；
若不等，则停止扩展，当前回文长度为right - left - 1
记录最长回文：跟踪扩展过程中找到的最长回文子串的长度和起始位置，最终输出该子串。
*/
#include <stdio.h>
#include <string.h>

int expandAroundCenter(char* s, int left, int right, int n) {
    while (left >= 0 && right < n && s[left] == s[right]) {
        left--;
        right++;
    }
    return right - left - 1;
}

int main() {
    char a[10000];
    fgets(a, sizeof(a), stdin);
    int len = strlen(a);
    if (len > 0 && a[len-1] == '\n') {
        a[len-1] = '\0';
        len--;
    }
    int n = len;
    if (n == 0) return 0;

    int start = 0, maxLen = 1;
    for (int i = 0; i < n; i++) {
        int len1 = expandAroundCenter(a, i, i, n);
        int len2 = expandAroundCenter(a, i, i+1, n);
        int len = len1 > len2 ? len1 : len2;
        if (len > maxLen) {
            maxLen = len;
            start = i - (len - 1) / 2;
        }
    }
    for (int i = start; i < start + maxLen; i++) {
        printf("%c", a[i]);
    }
    printf("\n");
    return 0;
}