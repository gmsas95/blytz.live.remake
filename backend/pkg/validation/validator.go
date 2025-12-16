package validation

import (
	"errors"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Custom validators
func RegisterCustomValidators(v *validator.Validate) {
	// Register custom validators
	v.RegisterValidation("email", validateEmail)
	v.RegisterValidation("password", validatePassword)
	v.RegisterValidation("slug", validateSlug)
}

// validateEmail validates email format
func validateEmail(fl validator.FieldLevel) bool {
	email := fl.Field().String()
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// validatePassword validates password strength
func validatePassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	
	if len(password) < 8 {
		return false
	}
	
	var hasUpper, hasLower, hasNumber, hasSpecial bool
	
	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUpper = true
		case char >= 'a' && char <= 'z':
			hasLower = true
		case char >= '0' && char <= '9':
			hasNumber = true
		case strings.ContainsRune("!@#$%^&*()_+-=[]{}|;:,.<>?", char):
			hasSpecial = true
		}
	}
	
	return hasUpper && hasLower && hasNumber && hasSpecial
}

// validateSlug validates URL-friendly slug format
func validateSlug(fl validator.FieldLevel) bool {
	slug := fl.Field().String()
	slugRegex := regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
	return slugRegex.MatchString(slug) && len(slug) > 0
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Tag     string `json:"tag"`
	Message string `json:"message"`
}

// GetValidationErrors extracts validation errors
func GetValidationErrors(err error) []ValidationError {
	var validationErrors []ValidationError
	
	if validationErrs, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrs {
			validationErrors = append(validationErrors, ValidationError{
				Field:   e.Field(),
				Tag:     e.Tag(),
				Message: getErrorMessage(e),
			})
		}
	}
	
	return validationErrors
}

// getErrorMessage returns user-friendly error message
func getErrorMessage(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Please enter a valid email address"
	case "password":
		return "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
	case "slug":
		return "Please enter a valid URL-friendly slug (lowercase letters, numbers, and hyphens only)"
	case "min":
		return "Must be at least " + e.Param() + " characters"
	case "max":
		return "Must be at most " + e.Param() + " characters"
	case "numeric":
		return "Must be a number"
	case "alpha":
		return "Must contain only letters"
	case "alphanum":
		return "Must contain only letters and numbers"
	default:
		return "Invalid value"
	}
}

// ValidateStruct validates a struct and returns errors
func ValidateStruct(v *validator.Validate, s interface{}) error {
	if err := v.Struct(s); err != nil {
		return errors.New("validation failed")
	}
	return nil
}