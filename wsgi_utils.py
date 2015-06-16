class PipeWrapper(object):
    """ Like Flask's FileWrapper, but designed for processes opened with
    Popen(). While FileWrapper *almost* works with pipes, it doesn't
    terminate the underlying process once the pipe is closed. This does.
    """

    def __init__(self, pipe, buffer_size=8192, copy_to_file=None):
        self.pipe = pipe
        self.buffer_size = buffer_size
        self.copy_to_file = copy_to_file

    def close(self):
        if self.copy_to_file:
            self.copy_to_file.close()
        self.pipe.stdout.close()
        self.pipe.terminate()
        self.pipe.wait()

    def __iter__(self):
        return self

    def next(self):
        data = self.pipe.stdout.read(self.buffer_size)
        if data:
            if self.copy_to_file:
                self.copy_to_file.write(data)
            return data
        raise StopIteration()
