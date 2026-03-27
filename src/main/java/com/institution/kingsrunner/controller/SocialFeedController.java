package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.dto.SocialPostDto;
import com.institution.kingsrunner.service.SocialFeedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenant/feed")
public class SocialFeedController {

    private final SocialFeedService feedService;

    public SocialFeedController(SocialFeedService feedService) {
        this.feedService = feedService;
    }

    @GetMapping
    public ResponseEntity<List<SocialPostDto>> getFeed() {
        return ResponseEntity.ok(feedService.getInstitutionFeed());
    }

    @PostMapping
    public ResponseEntity<String> createPost(@RequestBody String content) {
        feedService.createPost(content);
        return ResponseEntity.ok("Post published.");
    }
}
