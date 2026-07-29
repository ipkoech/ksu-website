# Container security model

Backend production images create UID/GID 10001 (`ksu`) and switch to it before runtime. Application, log, export, and upload directories are owned by that user. The frontend runtime already uses the non-root `nextjs` user. Compose does not publish internal service ports; future services must follow the same model.

CI inspects Dockerfiles, builds images, and scans the Main image with Trivy. Add a documented exception before introducing a root runtime or extra Linux capability. Prefer read-only filesystems and dropped capabilities in deployment-specific Compose hardening overlays after verifying upload/log behavior.
