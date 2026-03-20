package pn.wen.drawadmin.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;

public class ProcessUtil {
    public static String executeCommand(List<String> command) throws IOException, InterruptedException {
// 1. 创建 ProcessBuilder 并设置命令
        ProcessBuilder processBuilder = new ProcessBuilder(command);

        // 2. 合并标准错误流到标准输出流（方便统一读取）
        processBuilder.redirectErrorStream(true);

        // 3. 启动进程
        Process process = processBuilder.start();

        // 4. 读取进程输出（必须读取，否则子进程可能卡死）
        StringBuilder output = new StringBuilder();
        try (InputStream inputStream = process.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {

            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append(System.lineSeparator());
            }
        }

        // 5. 等待进程执行完成，获取退出码（0=成功，非0=失败）
        int exitCode = process.waitFor();
        output.append("\n退出码：").append(exitCode);

        return output.toString();
    }
}
