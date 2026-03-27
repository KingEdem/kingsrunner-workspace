package com.institution.kingsrunner.service;

import com.institution.kingsrunner.dto.SocialPostDto;
import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.SocialPost;
import com.institution.kingsrunner.repository.SocialPostRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SocialFeedService {

    private final SocialPostRepository postRepository;

    public SocialFeedService(SocialPostRepository postRepository) {
        this.postRepository = postRepository;
    }

    private AppUser getAuthenticatedUser() {
        return (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public List<SocialPostDto> getInstitutionFeed() {
        AppUser user = getAuthenticatedUser();
        return postRepository.findByInstitutionIdOrderByCreatedAtDesc(user.getInstitution().getId())
                .stream().map(post -> {
                    SocialPostDto dto = new SocialPostDto();
                    dto.setId(post.getId());
                    dto.setAuthorId(post.getAuthor().getId());
                    dto.setAuthorName(post.getAuthor().getFullName());
                    dto.setContent(post.getContent());
                    dto.setCreatedAt(post.getCreatedAt());
                    return dto;
                }).collect(Collectors.toList());
    }

    public void createPost(String content) {
        AppUser user = getAuthenticatedUser();
        SocialPost post = new SocialPost();
        post.setInstitutionId(user.getInstitution().getId());
        post.setAuthor(user);
        post.setContent(content);
        postRepository.save(post);
    }
}
