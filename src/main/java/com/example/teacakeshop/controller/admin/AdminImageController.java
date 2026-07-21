package com.example.teacakeshop.controller.admin;

import com.example.teacakeshop.dto.request.DeleteImageRequest;
import com.example.teacakeshop.dto.response.ImageUploadResponse;
import com.example.teacakeshop.dto.response.MessageResponse;
import com.example.teacakeshop.service.CloudinaryImageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/images")
public class AdminImageController {

    private final CloudinaryImageService imageService;

    public AdminImageController(
            CloudinaryImageService imageService
    ) {
        this.imageService = imageService;
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ImageUploadResponse uploadProductImage(
            @RequestParam("file")
            MultipartFile file
    ) {
        return imageService.uploadProductImage(
                file
        );
    }

    @PostMapping("/combos")
    @ResponseStatus(HttpStatus.CREATED)
    public ImageUploadResponse uploadComboImage(
            @RequestParam("file")
            MultipartFile file
    ) {
        return imageService.uploadComboImage(
                file
        );
    }

    @DeleteMapping
    public MessageResponse deleteImage(
            @Valid
            @RequestBody
            DeleteImageRequest request
    ) {
        imageService.delete(
                request.publicId()
        );

        return new MessageResponse(
                "Xóa ảnh thành công"
        );
    }
}