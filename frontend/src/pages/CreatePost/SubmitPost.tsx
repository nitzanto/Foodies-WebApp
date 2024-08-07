import { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Container,
  CircularProgress,
  FormControl,
  FormLabel,
  Rating,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCreatePost } from "../../hooks/useCreatePost";
import { POSTS_URL } from "../../utils/constants";
import useCurrentUser from "../../hooks/useCurrentUser";

const SubmitPost = () => {
  const navigate = useNavigate();
  const [review, setReview] = useState("");
  const [rating, setRating] = useState<number | null>(3);
  const [submitting, setSubmitting] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const { selectedBook } = useCreatePost();
  const { user } = useCurrentUser();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setLocalImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCreatePost = async () => {
    setSubmitting(true);

    const formData = new FormData();
    formData.append("userName", user?.userName || "");
    formData.append("bookTitle", selectedBook?.volumeInfo.title || "Sample Book Title");
    formData.append("bookAuthors", selectedBook?.volumeInfo.authors?.join(", ") || "Sample Author");
    formData.append("bookImage", selectedBook?.volumeInfo.imageLinks.thumbnail || "https://example.com/sample-image.jpg");
    formData.append("title", postTitle || "Sample Post Title");
    formData.append("rating", (rating || 3).toString());
    formData.append("description", review || "This is a sample review.");
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(POSTS_URL, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Post created successfully!");
        navigate("/");
      } else {
        console.error("Failed to create post:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setTimeout(() => {
        setSubmitting(false);
        navigate("/");
      }, 1500);
    }
  };

  useEffect(() => {
    if (!selectedBook && !submitting) {
      console.log("No book selected");
      navigate("/");
    }
  }, [selectedBook, submitting, navigate]);

  return (
    <Container>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        marginTop="10px"
        marginBottom="10px"
      >
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Submit a Post
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">
                    {selectedBook?.volumeInfo.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} style={{ textAlign: "center" }}>
                  <img
                    src={selectedBook?.volumeInfo.imageLinks.thumbnail}
                    alt={selectedBook?.volumeInfo.title}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Post Title"
                    variant="outlined"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Rating</FormLabel>
                    <Rating
                      name="rating"
                      value={rating}
                      onChange={(event, newValue) => {
                        setRating(newValue);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Write your review"
                    variant="outlined"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="contained-button-file"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="contained-button-file">
                    <Button
                      variant="contained"
                      color="primary"
                      component="span"
                    >
                      Upload Image
                    </Button>

                  </label>
                  {localImage && (
                    <img
                      src={localImage}
                      alt="Preview"
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button
                    onClick={handleCreatePost}
                    variant="contained"
                    color="primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Create Post"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SubmitPost;
