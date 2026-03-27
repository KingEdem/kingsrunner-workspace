package com.institution.kingsrunner.service;

import com.institution.kingsrunner.entity.Worker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class GeminiAiService {

    private static final Logger logger = Logger.getLogger(GeminiAiService.class.getName());

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GeminiAiService() {
        this.restTemplate = new RestTemplate();
    }

    public String generateOnboardingPlan(Worker worker) {
        try {
            String sector = (worker.getDepartment() != null
                    && worker.getDepartment().getInstitution() != null)
                    ? worker.getDepartment().getInstitution().getSector().toString()
                    : "General";

            String departmentName = (worker.getDepartment() != null)
                    ? worker.getDepartment().getName()
                    : "Unknown Department";

            String prompt = "Act as an expert HR consultant for the " + sector
                    + " sector. We just hired a new " + worker.getJobTitle()
                    + " for the " + departmentName
                    + " department. Provide a brief, 3-bullet-point onboarding strategy.";

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    GEMINI_URL + apiKey, request, Map.class);

            if (response != null && response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                @SuppressWarnings("unchecked")
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                return (String) parts.get(0).get("text");
            }

            return "AI Service: No content returned.";

        } catch (Exception e) {
            logger.warning("Gemini API call failed: " + e.getMessage());
            return "AI Service Unavailable";
        }
    }

    /**
     * Tenant-scoped conversational chat endpoint.
     * The system instruction hard-locks Gemini to the requesting institution,
     * preventing any cross-tenant data leakage.
     *
     * @param userMessage   The prompt submitted by the authenticated user.
     * @param institutionId The institution ID extracted from the JWT security context.
     * @return The raw text reply from Gemini, or a safe fallback message.
     */
    public String chat(String userMessage, String institutionId) {
        try {
            String systemInstruction =
                    "You are an embedded AI Analyst for an Enterprise Resource Planning (ERP) system " +
                    "called The Institution Runner. " +
                    "You are strictly bound to analyzing data for Institution ID: " + institutionId + ". " +
                    "You must never acknowledge, reference, or leak data from any other institution. " +
                    "If a question appears to request data outside this institution's scope, politely decline. " +
                    "Base all answers solely on the context provided for this specific institution. " +
                    "Be concise, professional, and data-focused in your responses.";

            Map<String, Object> requestBody = Map.of(
                    "system_instruction", Map.of(
                            "parts", List.of(Map.of("text", systemInstruction))
                    ),
                    "contents", List.of(
                            Map.of(
                                    "role", "user",
                                    "parts", List.of(Map.of("text", userMessage))
                            )
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    GEMINI_URL + apiKey, request, Map.class);

            if (response != null && response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                @SuppressWarnings("unchecked")
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                return (String) parts.get(0).get("text");
            }

            return "The AI Analyst returned no content. Please rephrase your query.";

        } catch (org.springframework.web.client.ResourceAccessException e) {
            logger.warning("Gemini API timeout or network error: " + e.getMessage());
            return "AI Analyst is currently unreachable. Please try again shortly.";
        } catch (Exception e) {
            logger.warning("Gemini chat call failed: " + e.getMessage());
            return "AI Analyst is temporarily unavailable.";
        }
    }

    /**
     * Headless CLI Parser — maps a raw natural-language input or misspelled command
     * to the single most likely valid terminal command for the Super Admin Terminal.
     *
     * The system instruction is deliberately strict so that Gemini returns nothing
     * but a bare "COMMAND_NAME - explanation" string with no prose or formatting.
     *
     * @param rawInput The unrecognized text the Super Admin typed.
     * @return A string in the format "COMMAND_NAME - Brief explanation and required args."
     */
    public String parseCommand(String rawInput) {
        try {
            String commandList =
                    // ── Global Actions & System ──
                    "SYSTEM_HEALTH\n" +
                    "find <natural language query>\n" +
                    "CLEAR\n" +
                    "HELP\n" +
                    "LOGOUT\n" +
                    // ── Tenant Management ──
                    "CREATE_INSTITUTION --name \"<name>\" --sector \"<sector>\"\n" +
                    "LIST_INSTITUTIONS\n" +
                    "SUSPEND_INSTITUTION --id \"<institutionId>\"\n" +
                    "ACTIVATE_INSTITUTION --id \"<institutionId>\"\n" +
                    "DELETE_INSTITUTION --id \"<institutionId>\"\n" +
                    "GET_TENANT_METRICS --id \"<institutionId>\"\n" +
                    // ── Tenant Records ──
                    "LIST_DEPARTMENTS\n" +
                    "CREATE_DEPT --name \"<deptName>\"\n" +
                    "LIST_WORKERS\n" +
                    "HIRE_WORKER --name \"<fullName>\" --email \"<email>\"\n" +
                    "DROP_WORKER --id \"<workerId>\"\n" +
                    // ── Identity & Access ──
                    "CREATE_INST_ADMIN --name \"<fullName>\" --email \"<email>\"\n" +
                    "GLOBAL_FIND_USER --email \"<email>\"\n" +
                    "FORCE_PASSWORD_RESET --id \"<userId>\"\n" +
                    "REVOKE_ALL_SESSIONS\n" +
                    // ── ERP Module Pipeline ──
                    "LIST_MODULES\n" +
                    "LIST_PENDING_REQUESTS\n" +
                    "APPROVE_MODULE_REQUEST\n" +
                    "REJECT_MODULE_REQUEST\n" +
                    "FORCE_ENABLE_MODULE --id \"<institutionId>\" --module \"<MODULE_KEY>\"\n" +
                    // ── Performance & Optimization ──
                    "SET_RATE_LIMIT --id \"<institutionId>\" --limit \"<number>\"\n" +
                    "CLEAR_TENANT_CACHE --id \"<institutionId>\"\n" +
                    // ── UI & Experience ──
                    "SET_UI_THEME --id \"<institutionId>\" --theme \"light|dark|system\"\n" +
                    // ── Data Compliance ──
                    "EXPORT_TENANT_AUDIT --id \"<institutionId>\"\n" +
                    "ANONYMIZE_DROPPED_WORKERS --id \"<institutionId>\"\n" +
                    // ── Dev God Mode ──
                    "SEED_MOCK_DATA --id \"<institutionId>\"\n" +
                    "NUKE_ALL_PENDING_REQUESTS";

            String systemInstruction =
                    "You are a headless CLI execution agent for 'The Institution Runner' ERP Super Admin Terminal.\n" +
                    "Your goal is to translate natural language into exact terminal commands, or provide helpful info.\n\n" +
                    "STRICT RULES:\n" +
                    "1. If the user describes an action that matches an available command, output ONLY the raw command string with appropriate flags. Extract named entities (names, emails, IDs) and embed them.\n" +
                    "2. If the user asks what a specific command does or asks for general help, do not translate it into a system command. Instead, respond EXACTLY in this format: INFO: [Insert your concise explanation here].\n" +
                    "3. If the user describes an action or asks for something, but NO available command exists to perform it, respond EXACTLY in this format: INFO: No existing command matches this action. You may need to create this specific command in the backend.\n" +
                    "4. Do NOT output prefixes like 'Suggested Command:', 'COMMAND:', or 'Answer:'. Do NOT wrap the output in quotes or backticks.\n" +
                    "5. The command list contains UI hints like '(scoped)' — NEVER include them in your output.\n\n" +
                    "AVAILABLE COMMANDS:\n" + commandList + "\n\n" +
                    "TRAINING EXAMPLES:\n" +
                    "- User: \"create a new institution called Apex Health in the medical sector\"\n" +
                    "  Output: CREATE_INSTITUTION --name \"Apex Health\" --sector \"medical\"\n" +
                    "- User: \"show me all workers\"\n" +
                    "  Output: LIST_WORKERS\n" +
                    "- User: \"create an admin called Jane with email jane@co.com\"\n" +
                    "  Output: CREATE_INST_ADMIN --name \"Jane\" --email \"jane@co.com\"\n" +
                    "- User: \"Suspend the account for Greenfield University\"\n" +
                    "  Output: SUSPEND_INSTITUTION --id \"Greenfield University\"\n" +
                    "- User: \"clear the cache for tenant 4\"\n" +
                    "  Output: CLEAR_TENANT_CACHE --id \"4\"\n" +
                    "- User: \"nuke all the pending requests\"\n" +
                    "  Output: NUKE_ALL_PENDING_REQUESTS\n" +
                    "- User: \"what exactly does ANONYMIZE_DROPPED_WORKERS do?\"\n" +
                    "  Output: INFO: ANONYMIZE_DROPPED_WORKERS permanently overwrites the names and emails of deleted workers to comply with privacy laws.\n" +
                    "- User: \"add a new dept called HR\"\n" +
                    "  Output: CREATE_DEPT --name \"HR\"\n" +
                    "- User: \"fire worker 12\"\n" +
                    "  Output: DROP_WORKER --id \"12\"\n" +
                    "- User: \"change the ui theme to dark for institution 5\"\n" +
                    "  Output: SET_UI_THEME --id \"5\" --theme \"dark\"\n" +
                    "- User: \"generate a monthly revenue report for all tenants\"\n" +
                    "  Output: INFO: No existing command matches this action. You may need to create this specific command in the backend.\n" +
                    "- User: \"I want to force reset the password for user 99\"\n" +
                    "  Output: FORCE_PASSWORD_RESET --id \"99\"";

            Map<String, Object> requestBody = Map.of(
                    "system_instruction", Map.of(
                            "parts", List.of(Map.of("text", systemInstruction))
                    ),
                    "contents", List.of(
                            Map.of(
                                    "role", "user",
                                    "parts", List.of(Map.of("text", rawInput))
                            )
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    GEMINI_URL + apiKey, request, Map.class);

            if (response != null && response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                @SuppressWarnings("unchecked")
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                return ((String) parts.get(0).get("text")).strip();
            }

            return "Unable to parse command — no response from AI.";

        } catch (org.springframework.web.client.ResourceAccessException e) {
            logger.warning("parseCommand: network error: " + e.getMessage());
            return "Terminal Copilot is unreachable. Check your connection.";
        } catch (Exception e) {
            logger.warning("parseCommand: " + e.getMessage());
            return "Terminal Copilot is temporarily unavailable.";
        }
    }
}