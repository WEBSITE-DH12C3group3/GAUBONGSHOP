package com.thubongshop.backend.chatbox;

import java.text.Normalizer;
import java.util.Locale;

public class TextUtils {
  public static String normalize(String s) {
    if (s == null) return "";
    String lower = s.toLowerCase(Locale.ROOT).trim();
    String nfd = Normalizer.normalize(lower, Normalizer.Form.NFD);
    return nfd.replaceAll("\\p{M}+", ""); // bỏ dấu
  }
}
