import os


class PipeWrapper(object):
    """ Like Flask's FileWrapper, but designed for processes opened with
    Popen(). While FileWrapper *almost* works with pipes, it doesn't
    terminate the underlying process once the pipe is closed. This does.
    """

    def __init__(self, pipe, buffer_size=8192, copy_to_filename=None):
        self.pipe = pipe
        self.buffer_size = buffer_size
        self.copy_to_filename = copy_to_filename
        if copy_to_filename:
            self.partial_filename = copy_to_filename + '.part'
            self.copy_to_file = open(self.partial_filename, 'w')
        else:
            self.copy_to_file = None

    def close(self):
        if self.copy_to_file:
            self.copy_to_file.close()
            # TODO: cleanup the incomplete file
        self.pipe.stdout.close()
        self.pipe.terminate()
        self.pipe.wait()

    def __iter__(self):
        return self

    def next(self):
        data = self.pipe.stdout.read(self.buffer_size)
        if data:
            if self.copy_to_filename:
                self.copy_to_file.write(data)
            return data
        if self.copy_to_filename:
            self.copy_to_file.close()
            # Now that it's done, remove the ".part" from the end of the
            # filename.
            try:
                os.rename(self.partial_filename, self.copy_to_filename)
            except OSError:
                print(
                    u"WARNING: Couldn't rename to {}".format(
                        self.copy_to_filename
                    )
                )
            self.copy_to_file = None
        raise StopIteration()
