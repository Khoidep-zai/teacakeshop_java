package com.example.teacakeshop.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.teacakeshop.dto.response.ImageUploadResponse;
import com.example.teacakeshop.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class CloudinaryImageService {

    private static final long MAX_FILE_SIZE =
            5L * 1024L * 1024L;

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp"
            );

    private final Cloudinary cloudinary;

    public CloudinaryImageService(
            Cloudinary cloudinary
    ) {
        this.cloudinary = cloudinary;
    }

    public ImageUploadResponse uploadProductImage(
            MultipartFile file
    ) {
        return upload(
                file,
                "tea-cake-shop/products"
        );
    }

    public ImageUploadResponse uploadComboImage(
            MultipartFile file
    ) {
        return upload(
                file,
                "tea-cake-shop/combos"
        );
    }

    public ImageUploadResponse upload(
            MultipartFile file,
            String folder
    ) {
        validateFile(file);

        String publicId =
                generatePublicId(
                        file.getOriginalFilename()
                );

        try {
            Map<?, ?> result =
                    cloudinary
                            .uploader()
                            .upload(
                                    file.getBytes(),
                                    ObjectUtils.asMap(
                                            "folder", folder,
                                            "public_id", publicId,
                                            "resource_type", "image",
                                            "overwrite", false,
                                            "unique_filename", false
                                    )
                            );

            return new ImageUploadResponse(
                    getString(result, "public_id"),
                    getString(result, "secure_url"),
                    getString(result, "format"),
                    getLong(result, "bytes"),
                    getInteger(result, "width"),
                    getInteger(result, "height")
            );

        } catch (IOException exception) {
            throw new BadRequestException(
                    "Không thể đọc file ảnh"
            );

        } catch (RuntimeException exception) {
            throw new BadRequestException(
                    "Upload ảnh lên Cloudinary thất bại"
            );
        }
    }

    public void delete(
            String publicId
    ) {
        if (publicId == null
                || publicId.isBlank()) {

            throw new BadRequestException(
                    "Public ID không được để trống"
            );
        }

        try {
            cloudinary
                    .uploader()
                    .destroy(
                            publicId.trim(),
                            ObjectUtils.asMap(
                                    "resource_type",
                                    "image",
                                    "invalidate",
                                    true
                            )
                    );

        } catch (IOException exception) {
            throw new BadRequestException(
                    "Không thể xóa ảnh trên Cloudinary"
            );

        } catch (RuntimeException exception) {
            throw new BadRequestException(
                    "Xóa ảnh trên Cloudinary thất bại"
            );
        }
    }

    private void validateFile(
            MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(
                    "File ảnh không được để trống"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException(
                    "Dung lượng ảnh tối đa là 5MB"
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null
                || !ALLOWED_CONTENT_TYPES.contains(
                contentType.toLowerCase(
                        Locale.ROOT
                )
        )) {

            throw new BadRequestException(
                    "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP"
            );
        }
    }

    private String generatePublicId(
            String originalFilename
    ) {
        String baseName =
                originalFilename == null
                        ? "image"
                        : originalFilename;

        int dotIndex =
                baseName.lastIndexOf('.');

        if (dotIndex > 0) {
            baseName =
                    baseName.substring(
                            0,
                            dotIndex
                    );
        }

        String normalized =
                baseName
                        .trim()
                        .toLowerCase(Locale.ROOT)
                        .replaceAll(
                                "[^a-z0-9]+",
                                "-"
                        )
                        .replaceAll(
                                "^-+|-+$",
                                ""
                        );

        if (normalized.isBlank()) {
            normalized = "image";
        }

        return normalized
                + "-"
                + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 10);
    }

    private String getString(
            Map<?, ?> result,
            String key
    ) {
        Object value = result.get(key);

        return value == null
                ? null
                : value.toString();
    }

    private Long getLong(
            Map<?, ?> result,
            String key
    ) {
        Object value = result.get(key);

        if (value instanceof Number number) {
            return number.longValue();
        }

        return null;
    }

    private Integer getInteger(
            Map<?, ?> result,
            String key
    ) {
        Object value = result.get(key);

        if (value instanceof Number number) {
            return number.intValue();
        }

        return null;
    }
}