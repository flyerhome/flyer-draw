package pn.wen.drawadmin.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;

public class FfmpegUtil {

    public static void main(String[] args) {
        try {
            // 命令列表（拆分参数，避免空格/特殊字符问题）
            List<String> command = List.of("ffmpeg", "-version");
            String result = ProcessUtil.executeCommand(command);
            System.out.println("命令执行结果：\n" + result);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
