package team.lebron;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // allow frontend calls
public class ApiController {
    
    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("hello", "Hello from SpringBoot!");
        response.put("team", "Team LeBron");
        return response;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest logReq) {
        System.out.println("Attempted login request");
        final LoginResponse logRes = processLogin(logReq);
        final HashMap<String, String> response = new HashMap<>();
        response.put("success", String.valueOf(logRes.isSuccess()));
        response.put("message", logRes.getMessage());
        return response;
    }

    private LoginResponse processLogin(LoginRequest logReq) {
        return new LoginResponse(true, "Login success");
    }
}