import os
import sys
import pytest
from unittest.mock import patch, MagicMock
import deploy_hf

# The test environment may not have a real token or HF secrets
# Mocking secrets or setting token for deploy_hf
os.environ["HF_TOKEN"] = "fake-token"
deploy_hf.TOKEN = "fake-token"

@patch("deploy_hf.HfApi")
@patch("os.path.exists")
def test_successful_execution(mock_exists, mock_hf_api_class):
    # Setup mocks
    mock_exists.return_value = True

    mock_api_instance = MagicMock()
    mock_hf_api_class.return_value = mock_api_instance
    mock_api_instance.whoami.return_value = {"name": "test_user"}

    # Execute the function
    try:
        deploy_hf.main()
    except Exception as e:
        pytest.fail(f"main() raised {type(e).__name__} unexpectedly!")

    # Assertions
    mock_hf_api_class.assert_called_once_with(token="fake-token")
    mock_api_instance.whoami.assert_called_once()

    mock_api_instance.create_repo.assert_called_once_with(
        repo_id="test_user/bruno-fit",
        repo_type="space",
        space_sdk="static",
        private=False,
        exist_ok=True
    )

    # 7 files are expected to be uploaded
    assert mock_api_instance.upload_file.call_count == 7

@patch("deploy_hf.HfApi")
def test_token_verification_failure(mock_hf_api_class):
    mock_api_instance = MagicMock()
    mock_hf_api_class.return_value = mock_api_instance
    mock_api_instance.whoami.side_effect = Exception("Invalid token")

    with pytest.raises(SystemExit) as exc_info:
        deploy_hf.main()

    assert exc_info.value.code == 1

@patch("deploy_hf.HfApi")
def test_repository_creation_failure(mock_hf_api_class):
    mock_api_instance = MagicMock()
    mock_hf_api_class.return_value = mock_api_instance
    mock_api_instance.whoami.return_value = {"name": "test_user"}
    mock_api_instance.create_repo.side_effect = Exception("Creation failed")

    with pytest.raises(SystemExit) as exc_info:
        deploy_hf.main()

    assert exc_info.value.code == 1

@patch("deploy_hf.HfApi")
@patch("os.path.exists")
def test_missing_local_file(mock_exists, mock_hf_api_class):
    mock_api_instance = MagicMock()
    mock_hf_api_class.return_value = mock_api_instance
    mock_api_instance.whoami.return_value = {"name": "test_user"}

    # First check in deploy_hf is maybe secrets, but we want the files to fail
    # We can use a side_effect to return True for everything EXCEPT one file
    def exists_side_effect(path):
        if "index.html" in str(path):
            return False
        return True

    mock_exists.side_effect = exists_side_effect

    with pytest.raises(SystemExit) as exc_info:
        deploy_hf.main()

    assert exc_info.value.code == 1

@patch("deploy_hf.HfApi")
@patch("os.path.exists")
def test_file_upload_failure(mock_exists, mock_hf_api_class):
    mock_exists.return_value = True

    mock_api_instance = MagicMock()
    mock_hf_api_class.return_value = mock_api_instance
    mock_api_instance.whoami.return_value = {"name": "test_user"}
    mock_api_instance.upload_file.side_effect = Exception("Upload failed")

    with pytest.raises(SystemExit) as exc_info:
        deploy_hf.main()

    assert exc_info.value.code == 1
